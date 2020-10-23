import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { FileInfo, FileInfoDocument } from './fileInfo.schema';
import {createWriteStream, unlink} from 'fs'
import { AccountInfosService } from 'src/accountInfos/accountInfos.service';
import { extname } from 'path';
const path = require('path');
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class FSService {
  constructor(@InjectModel(FileInfo.name) private fileInfoModel : Model<FileInfoDocument>, private readonly accountInfoService: AccountInfosService, private readonly jwtService: JwtService){}
  
  async saveFileInfo(userId: string, filename: string ){
    const newFile = new this.fileInfoModel({owner: userId, file_name: filename})
    return await newFile.save();
  }
  async getFileInfo(fileId: string){
    const fileInfo = await this.fileInfoModel.findById(fileId);
    if(fileInfo == null) {
      throw new HttpException('cannot find this file: '+fileId,HttpStatus.NOT_FOUND)
    }
    return fileInfo
  }
  
  async saveFiles(rootPath: string, owner: string, files: any){
    let result :any
    result = {}
    const user = await this.accountInfoService.getAccountInfo(owner)
    if(user==null){
      throw new HttpException('cannot find user: '+owner,HttpStatus.NOT_FOUND)
    }
    for (let field in files){
      const file = files[field] == null? null: files[field][0]
      if(file == null ) continue

      const fileInfo = await this.saveFile(rootPath, owner, file)
      result[field] = fileInfo._id
      this.deleteFile(rootPath,user[field+'_file'])
      user[field+'_file'] = fileInfo._id
    }
    await user.save()
    return result
  }

  async saveFile(rootPath: string, owner: string, file: Express.Multer.File){
    if(file == null) return
    const newFile = new this.fileInfoModel({owner, file_name:file.originalname, ext: extname(file.originalname)})
    const  ws = createWriteStream(path.join(rootPath,newFile._id.toString()+newFile.ext))
    ws.write(file.buffer)  
    return await newFile.save()
  }

  async deleteFile(rootPath: string, fileId: string){
    if(fileId==null) return 
    const fileInfo = await this.getFileInfo(fileId)
    const fullPath = path.join(rootPath,fileInfo._id+fileInfo.ext)
    unlink(fullPath,(err)=>{
      console.log('cant delete file',err)
    })
    fileInfo.remove()
  }

  generateViewFileToken(fileId: string): string{
    return this.jwtService.sign({fileId},{expiresIn: '2m'})
  }

  extractFileId(token: string): string{
    return this.jwtService.verify(token).fileId
  }

}