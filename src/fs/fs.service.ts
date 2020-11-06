import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { FileInfo, FileInfoDocument } from './fileInfo.schema';
import {createWriteStream, unlink, existsSync} from 'fs'
import { extname } from 'path';
const path = require('path');
import { JwtService } from '@nestjs/jwt';
import { UsersService } from 'src/users/users.service';
import { Account, OtherUser } from 'src/users/interfaces/user.interface';

@Injectable()
export class FSService {
  constructor(@InjectModel(FileInfo.name) private fileInfoModel : Model<FileInfoDocument>, private readonly usersService:UsersService,  @InjectModel('Other') private otherUserModel:Model<OtherUser>,private readonly jwtService: JwtService){}
  
  async getFileInfo(fileId: string){
    const fileInfo = await this.fileInfoModel.findById(fileId);
    if(fileInfo == null) {
      throw new HttpException('cannot find this file: '+fileId,HttpStatus.NOT_FOUND)
    }
    if(!existsSync(fileInfo.full_path)){
      await fileInfo.remove()
      throw new HttpException('This file is deleted: '+fileId,HttpStatus.INTERNAL_SERVER_ERROR)
    }
    return fileInfo
  }
  
  async saveFiles(rootPath: string, owner: string, files: any){
    let result :any
    result = {}
    const user = await this.otherUserModel.findById(owner)
    if(user==null){
      throw new HttpException('cannot find user: '+owner,HttpStatus.NOT_FOUND)
    }
    for (let field in files){
      const file = files[field] == null? null: files[field][0]
      if(file == null ) continue
      
      const fileInfo = await this.saveFile(rootPath, owner, file, field)
      result[field] = fileInfo._id
      this.deleteFile(rootPath,user[field])
      user[field] = fileInfo._id
    }
    await user.save()
    return result
  }
  
  async saveFile(rootPath: string, owner: string, file: Express.Multer.File, fileType: string){
    if(file == null) return
    const newFile = new this.fileInfoModel({owner, file_name:file.originalname, ext: extname(file.originalname), file_type:fileType})
    newFile.full_path = path.join(rootPath,newFile._id.toString()+newFile.ext)
    const  ws = createWriteStream(newFile.full_path)
    ws.write(file.buffer)  
    return await newFile.save()
  }
  
  async deleteFile(rootPath: string, fileId: string){
    if(fileId==null) return 
    const fileInfo = await this.getFileInfo(fileId)
    const fullPath = fileInfo.full_path
    const owner = await this.otherUserModel.findById(fileInfo.owner)
    owner[fileInfo.file_type] = null
    unlink(fullPath,(err)=>{
      if(err) console.log('cant delete file',err)
    })
    owner.save()
    fileInfo.remove()
  }
  
  generateViewFileToken(fileId: string): string{
    return this.jwtService.sign({fileId},{expiresIn: '2m'})
  }
  
  extractFileId(token: string): string{
    try {
      return this.jwtService.verify(token).fileId
    }catch(err){
      throw new HttpException('Invalid Token',HttpStatus.BAD_REQUEST)
    }
  }

  async verifyUserEligibility(userId: any) {
    const user = await this.usersService.getUserById(userId)
    return user.account_type == Account.Other
  }
  
}