import { HttpException, HttpStatus, Injectable } from "@nestjs/common"
import { InjectModel } from "@nestjs/mongoose"
import { createWriteStream, existsSync, unlinkSync } from "fs"
import { Model } from "mongoose"
import { extname } from "path"
import { AuthService } from "src/auth/auth.service"
import { Account, MAX_PREV_SLIPS, OtherUser } from "src/users/interfaces/user.interface"
import { UsersService } from "src/users/users.service"
import { FileInfo, FileInfoDocument } from "./fileInfo.schema"
import * as path from "path"

@Injectable()
export class FSService {
  constructor(
    @InjectModel(FileInfo.name) private fileInfoModel: Model<FileInfoDocument>,
    private userService: UsersService,
    private authService: AuthService
  ) { }

  async getFileInfo(fileId: string) {
    const fileInfo = await this.fileInfoModel.findById(fileId)

    if (fileInfo == null) {
      throw new HttpException("cannot find this file: " + fileId, HttpStatus.NOT_FOUND)
    }

    if (!existsSync(fileInfo.full_path)) {
      await fileInfo.remove()
      throw new HttpException("This file is deleted: " + fileId, HttpStatus.INTERNAL_SERVER_ERROR)
    }

    return fileInfo
  }

  async saveFiles(rootPath: string, owner: string, files) {
    if (!files) {
      return {}
    }
    const result = {}

    const user = (await this.userService.findById(owner)) as OtherUser;

    if (user == null) {
      throw new HttpException("cannot find user: " + owner, HttpStatus.NOT_FOUND)
    }

    const fileFields = ["user_photo", "medical_certificate", "national_id_house_registration", "relationship_verification_document"]

    for (const field of fileFields) {
      const file = files[field] == null ? null : files[field][0]
      if (file == null) continue
      const fileInfo = await this.saveFile(rootPath, owner, file, field)
      result[field] = fileInfo._id
      this.deleteFile(user[field])
      user[field] = fileInfo._id
    }

    if (files.payment_slip != null) {
      const fileInfo = await this.saveFile(rootPath, owner, files.payment_slip[0], "payment_slip");
      if (user.payment_slip != null) user.previous_payment_slips.push(user.payment_slip);
      while (user.previous_payment_slips.length > MAX_PREV_SLIPS) { // runs only once for most cases
        // good enough for MAX_PREV_SLIP = 2 
        const removedFile = user.previous_payment_slips.shift();
        await this.deleteFile(removedFile.toHexString());
      }
      result["payment_slip"] = fileInfo._id;
      user.payment_slip = fileInfo._id;
    }
    await user.save()
    return result
  }

  async saveFile(rootPath: string, owner: string, file: Express.Multer.File, fileType: string) {
    if (file == null) return

    const newFile = new this.fileInfoModel({ owner, file_name: file.originalname, ext: extname(file.originalname), file_type: fileType })
    newFile.full_path = path.join(rootPath, newFile._id.toString() + newFile.ext)

    const ws = createWriteStream(newFile.full_path)
    ws.write(file.buffer)

    return await newFile.save()
  }

  async deleteFile(fileId: string) {
    if (fileId == null) return;

    const fileInfo = await await this.fileInfoModel.findById(fileId).populate("owner");

    if (fileInfo == null) return;

    const fullPath = fileInfo.full_path;
    const owner = fileInfo.owner;
    if (fileId == owner[fileInfo.file_type]) {
      owner[fileInfo.file_type] = null;
    }

    try {
      unlinkSync(fullPath)
    } catch (err) {
      console.log("Cannot delete file: " + fileId)
    }

    await owner.save();
    await fileInfo.remove();
  }

  generateViewFileToken(fileId: string): string {
    return this.authService.generateCustomJWT({ fileId }, { expiresIn: "2m" })
  }

  extractFileId(token: string): string {
    try {
      return this.authService.verifyJWT(token).fileId
    } catch (err) {
      throw new HttpException("Invalid Token", HttpStatus.BAD_REQUEST)
    }
  }

  async verifyUserEligibility(userId: string) {
    const user = await this.userService.findById(userId)
    return user != null && user.account_type == Account.Other
  }
}
