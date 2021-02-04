import {
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Query,
  Req,
  Res,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common"
import { ConfigService } from "@nestjs/config"
import { FileFieldsInterceptor } from "@nestjs/platform-express"
import { JwtAuthGuard, StaffGuard } from "src/auth/jwt.guard"
import { FSService } from "./fs.service"

@Controller("fs")
export class FSController {
  private static fileUploadConfig = [
    { name: "user_photo", maxCount: 1 },
    { name: "medical_certificate", maxCount: 1 },
    { name: "national_id_house_registration", maxCount: 1 },
    { name: "relationship_verification_document", maxCount: 1 },
    { name: "payment_slip", maxCount: 1 }
  ]

  private static maxFileSize = 2 * 1000 * 1000

  constructor(private readonly fsService: FSService, private readonly configService: ConfigService) { }

  @UseGuards(JwtAuthGuard)
  @Post("upload")
  @UseInterceptors(FileFieldsInterceptor(FSController.fileUploadConfig, { limits: { fileSize: FSController.maxFileSize } }))
  async uploadFile(@UploadedFiles() files, @Req() req) {
    const eligible = await this.fsService.verifyUserEligibility(req.user.userId)
    if (!eligible) throw new HttpException("This user cannot upload", HttpStatus.FORBIDDEN)
    return this.fsService.saveFiles(this.configService.get("UPLOAD_DEST"), req.user.userId, files)
  }

  @Get("/view")
  async viewFile(@Res() res, @Query("token") token: string) {
    if (!token) throw new HttpException("No token", HttpStatus.FORBIDDEN)
    const fileId = this.fsService.extractFileId(token)
    const fileInfo = await this.fsService.getFileInfo(fileId)
    res.sendFile(fileInfo.full_path)
  }

  @UseGuards(JwtAuthGuard)
  @Get("/viewFileToken/:fileId")
  async viewFileToken(@Req() req, @Res() res, @Param("fileId") fileId: string) {
    const fileInfo = await this.fsService.getFileInfo(fileId)
    if (!req.user.isStaff && fileInfo.owner != req.user.userId) {
      throw new HttpException("Unauthorized", HttpStatus.UNAUTHORIZED)
    } else {
      res.send({ token: this.fsService.generateViewFileToken(fileId) })
    }
  }

  @UseGuards(StaffGuard)
  @Delete("admin/delete/:fileId")
  async deleteFileAdmin(@Req() req, @Param("fileId") fileId: string) {
    const fileInfo = await this.fsService.getFileInfo(fileId)
    await this.fsService.deleteFile(fileInfo._id)
    return fileInfo
  }

  @UseGuards(StaffGuard)
  @Post("admin/upload/:userId")
  @UseInterceptors(FileFieldsInterceptor(FSController.fileUploadConfig, { limits: { fileSize: FSController.maxFileSize } }))
  async uploadFileAdmin(@UploadedFiles() files, @Req() req, @Res() res, @Param("userId") userId: string) {
    res.send(await this.fsService.saveFiles(this.configService.get("UPLOAD_DEST"), userId, files))
  }
}
