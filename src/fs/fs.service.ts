import { HttpException, HttpStatus, Injectable } from "@nestjs/common"
import { InjectModel } from "@nestjs/mongoose"
import { createWriteStream, existsSync, mkdirSync, unlinkSync } from "fs"
import { Model } from "mongoose"
import { extname } from "path"
import { AuthService } from "src/auth/auth.service"
import { Account, MAX_PREV_SLIPS, OtherUser, DocumentStatus, SatitCuPersonelUser, User, Verification } from "src/users/interfaces/user.interface"
import { UsersService } from "src/users/users.service"
import { FileInfo, FileInfoDocument } from "./fileInfo.schema"
import * as path from "path"
import { UploadedFilesOther, UploadedFilesSatit } from "./fs.interface"
import { ConfigService } from "@nestjs/config"

@Injectable()
export class FSService {
  constructor(
    @InjectModel(FileInfo.name) private fileInfoModel: Model<FileInfoDocument>,
    private userService: UsersService,
    private authService: AuthService,
    private configService: ConfigService
  ) {
    this.rootPath = this.configService.get("UPLOAD_DEST")
  }

  private rootPath: string

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

  async deleteUserFiles(user: User) {
    if (user.account_type == Account.Other) this.deleteUserFilesOther(user as OtherUser)
    else if (user.account_type == Account.SatitAndCuPersonel) this.deleteUserFilesSatit(user as SatitCuPersonelUser)
  }

  async deleteUserFilesOther(user: OtherUser) {
    const fileFields = ["user_photo", "medical_certificate", "national_id_house_registration", "relationship_verification_document", "payment_slip"]
    for (const field of fileFields) {
      await this.deleteFile(user[field])
    }
    for (const slip of user.previous_payment_slips) {
      await this.deleteFile(slip.toHexString())
    }
  }

  async deleteUserFilesSatit(user: SatitCuPersonelUser) {
    if (user.account_type != Account.SatitAndCuPersonel) return
    await this.deleteFile(user.student_card_photo.toHexString())
    for (const slip of user.previous_student_card_photo) {
      await this.deleteFile(slip.toHexString())
    }
  }

  async saveFiles(rootPath: string, owner: string, files: UploadedFilesOther, admin = false): Promise<Record<string, string>> {
    if (!files) {
      return { result: null, user: null }
    }
    const result = {}

    const user = (await this.userService.findById(owner)) as OtherUser

    if (user == null) {
      throw new HttpException("cannot find user: " + owner, HttpStatus.NOT_FOUND)
    }

    const fileFields = ["user_photo", "medical_certificate", "national_id_house_registration", "relationship_verification_document"]

    for (const field of fileFields) {
      const file = files[field] ? files[field][0] : null
      if (file == null) continue
      const fileInfo = await this.saveFile(rootPath, owner, file, field)
      result[field] = fileInfo._id
      this.deleteFile(user[field])
      user[field] = fileInfo._id
    }

    // save file if payment_slip is uploaded
    if (files.payment_slip != null && ((user.document_status != "Submitted" && user.verification_status != "Submitted") || admin)) {
      const fileInfo = await this.saveFile(rootPath, owner, files.payment_slip[0], "payment_slip")
      result["payment_slip"] = fileInfo._id
      user.payment_slip = fileInfo._id
      // if the user is still in registeration process, document_status will not be changed
      // document status is only changed during membership extension process
      // if the file is uploaded by admin, statuses won't change
      if (!admin && user.verification_status == "Verified") user.document_status = "Submitted"
    }

    // if uploaded by admin when the user haven't submit the document for membership extension
    if (files.payment_slip != null && admin && user.verification_status == "Verified" && user.document_status == "NotSubmitted") {
      user.previous_payment_slips.push(user.payment_slip)
      while (user.previous_payment_slips.length > MAX_PREV_SLIPS) {
        // runs more than once only when MAX_PREV_SLIPS is decreased
        // good enough for MAX_PREV_SLIP = 2
        const removedFile = user.previous_payment_slips.shift()
        await this.deleteFile(removedFile.toHexString())
      }
    }
    await user.save()
    return result
  }

  async saveFilesSatit(rootPath: string, owner: string, files: UploadedFilesSatit, admin = false) {
    if (!files || files.student_card_photo == null) {
      return {}
    }
    const result = { student_card_photo: null }

    const user = (await this.userService.findById(owner)) as SatitCuPersonelUser

    if (user == null) {
      throw new HttpException("cannot find user: " + owner, HttpStatus.NOT_FOUND)
    }

    // save file
    if ((user.document_status != "Submitted" && user.verification_status != "Submitted") || admin) {
      const fileInfo = await this.saveFile(rootPath, owner, files.student_card_photo[0], "student_card_photo")
      result.student_card_photo = fileInfo._id
      user.student_card_photo = fileInfo._id
      // if the user is still in registeration process, document_status will not be changed
      // document status is only changed during membership extension process
      // if the file is uploaded by admin, statuses won't change
      if (!admin && user.verification_status == "Verified") user.document_status = "Submitted"
    }

    // if uploaded by admin and the user haven't submit the document for membership extension
    if (admin && user.verification_status == "Verified" && user.document_status == "NotSubmitted") {
      user.previous_student_card_photo.push(user.student_card_photo)
      while (user.previous_student_card_photo.length > MAX_PREV_SLIPS) {
        // runs more than once only when MAX_PREV_SLIPS is decreased
        // good enough for MAX_PREV_SLIP = 2
        const removedFile = user.previous_student_card_photo.shift()
        await this.deleteFile(removedFile.toHexString())
      }
    }
    await user.save()
    return result
  }

  // should not be used in future codes, this will change some value of the file's owner
  // left here for compatibility with some old codes
  async saveFile(rootPath: string, owner: string, file: Express.Multer.File, fileType: string) {
    if (file == null) return

    const newFile = new this.fileInfoModel({ owner, file_name: file.originalname, ext: extname(file.originalname), file_type: fileType })
    const dir = path.join(rootPath, newFile.file_type)
    newFile.full_path = path.join(dir, newFile._id.toString() + newFile.ext)
    if (!existsSync(dir)) {
      mkdirSync(dir)
    }
    const ws = createWriteStream(newFile.full_path)
    ws.write(file.buffer)

    return await newFile.save()
  }

  async createFile(owner: User, file: Express.Multer.File, fileType: string) {
    if (file == null) return null
    const newFile = new this.fileInfoModel({ owner, file_name: file.originalname, ext: extname(file.originalname), file_type: fileType })
    const dir = path.join(this.rootPath, newFile.file_type)
    newFile.full_path = path.join(dir, newFile._id.toString() + newFile.ext)
    if (!existsSync(dir)) {
      mkdirSync(dir)
    }
    const ws = createWriteStream(newFile.full_path)
    ws.write(file.buffer)
    return await newFile.save()
  }

  async removeFile(fileId: string) {
    if (fileId == null) return

    const fileInfo = await await this.fileInfoModel.findById(fileId).populate("owner")

    if (fileInfo == null) return

    const fullPath = fileInfo.full_path
    const owner = fileInfo.owner
    if (owner != null && fileId == owner[fileInfo.file_type]) {
      owner[fileInfo.file_type] = null
    }

    try {
      unlinkSync(fullPath)
    } catch (err) {
      console.log("Cannot delete file: " + fileId)
    }

    await fileInfo.remove()
  }

  // should not be used in future codes, this will change some value of the file's owner
  // left here for compatibility with some old codes
  async deleteFile(fileId: string) {
    if (fileId == null) return

    const fileInfo = await await this.fileInfoModel.findById(fileId).populate("owner")

    if (fileInfo == null) return

    const fullPath = fileInfo.full_path
    const owner = fileInfo.owner
    if (owner != null && fileId == owner[fileInfo.file_type]) {
      owner[fileInfo.file_type] = null
    }

    try {
      unlinkSync(fullPath)
    } catch (err) {
      console.log("Cannot delete file: " + fileId)
    }

    if (owner != null) await owner.save()
    await fileInfo.remove()
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

  async verifyIsSatit(userId: string) {
    const user = await this.userService.findById(userId)
    return user != null && user.account_type == Account.SatitAndCuPersonel
  }

  // used when approving payment slip
  async updatePaymentSlip(user: OtherUser) {
    if (user.payment_slip != null) user.previous_payment_slips.push(user.payment_slip)
    while (user.previous_payment_slips.length > MAX_PREV_SLIPS) {
      // runs more than once only when MAX_PREV_SLIPS is decreased
      // good enough for MAX_PREV_SLIP = 2
      const removedFile = user.previous_payment_slips.shift()
      await this.deleteFile(removedFile.toHexString())
    }
    user.document_status = "NotSubmitted"
    await user.save()
  }

  // used when approving payment slip
  async updateStudentCardPhoto(user: SatitCuPersonelUser) {
    if (user.student_card_photo != null) user.previous_student_card_photo.push(user.student_card_photo)
    while (user.previous_student_card_photo.length > MAX_PREV_SLIPS) {
      // runs more than once only when MAX_PREV_SLIPS is decreased
      // good enough for MAX_PREV_SLIP = 2
      const removedFile = user.previous_student_card_photo.shift()
      await this.deleteFile(removedFile.toHexString())
    }
    user.document_status = "NotSubmitted"
    await user.save()
  }
}
