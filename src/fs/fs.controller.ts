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
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiParam,
  ApiProperty,
  ApiQuery,
  ApiTags,
  ApiUnauthorizedResponse,
} from "@nestjs/swagger"
import { JwtAuthGuard, StaffGuard } from "src/auth/jwt.guard"
import { Role } from "src/common/roles"
import { FileInfo, GenerateTokenResponse } from "./fileInfo.schema"
import { FSService } from "./fs.service"

@ApiBearerAuth()
@ApiTags("fs")
@Controller("fs")
export class FSController {
  public static fileUploadConfig = [
    { name: "user_photo", maxCount: 1 },
    { name: "medical_certificate", maxCount: 1 },
    { name: "national_id_house_registration", maxCount: 1 },
    { name: "relationship_verification_document", maxCount: 1 },
    { name: "payment_slip", maxCount: 1 },
  ]

  public static fileUploadConfigSatit = [{ name: "student_card_photo", maxCount: 1 }]

  public static maxFileSize = 2 * 1000 * 1000

  constructor(private readonly fsService: FSService, private readonly configService: ConfigService) {}

  @ApiInternalServerErrorResponse({
    description: "Can't upload file ( likely caused by insufficient write permission )",
  })
  @ApiNotFoundResponse({
    description: "Can't find the user",
  })
  @ApiUnauthorizedResponse({
    description: "Not logged in",
  })
  @ApiForbiddenResponse({
    description: "This user can't upload file, only the other type can upload",
  })
  @UseGuards(JwtAuthGuard)
  @Post("upload")
  @UseInterceptors(FileFieldsInterceptor(FSController.fileUploadConfig, { limits: { fileSize: FSController.maxFileSize } }))
  async uploadFile(@UploadedFiles() files, @Req() req) {
    const eligible = await this.fsService.verifyUserEligibility(req.user.userId)
    if (!eligible) throw new HttpException("This user cannot upload", HttpStatus.FORBIDDEN)
    return await this.fsService.saveFiles(this.configService.get("UPLOAD_DEST"), req.user.userId, files)
  }

  @ApiInternalServerErrorResponse({
    description: "Can't upload file ( likely caused by insufficient write permission )",
  })
  @ApiNotFoundResponse({
    description: "Can't find the user",
  })
  @ApiUnauthorizedResponse({
    description: "Not logged in",
  })
  @ApiForbiddenResponse({
    description: "Only the satit type can use this endpoint",
  })
  @UseGuards(JwtAuthGuard)
  @Post("uploadSatit")
  @UseInterceptors(FileFieldsInterceptor(FSController.fileUploadConfigSatit, { limits: { fileSize: FSController.maxFileSize } }))
  async uploadFileSatit(@UploadedFiles() files, @Req() req) {
    const eligible = await this.fsService.verifyUserEligibilitySatit(req.user.userId)
    if (!eligible) throw new HttpException("This user cannot upload", HttpStatus.FORBIDDEN)
    return this.fsService.saveFilesSatit(this.configService.get("UPLOAD_DEST"), req.user.userId, files)
  }

  @ApiQuery({
    name: "token",
    description: "token generated from fs/viewFileToken/:fileId",
  })
  @ApiForbiddenResponse({
    description: "No view file token",
  })
  @ApiNotFoundResponse({
    description: "Can't find the file",
  })
  @Get("/view")
  async viewFile(@Res() res, @Query("token") token: string) {
    if (!token) throw new HttpException("No token", HttpStatus.BAD_REQUEST)
    const fileId = this.fsService.extractFileId(token)
    const fileInfo = await this.fsService.getFileInfo(fileId)
    res.sendFile(fileInfo.full_path)
  }

  @ApiUnauthorizedResponse({
    description: "User is not the owner of the file",
  })
  @ApiNotFoundResponse({
    description: "Can't find the file",
  })
  @ApiInternalServerErrorResponse({
    description: "This file is already deleted",
  })
  @ApiOkResponse({
    description: "Generated the token",
    type: GenerateTokenResponse,
  })
  @ApiOkResponse()
  @UseGuards(JwtAuthGuard)
  @Get("/viewFileToken/:fileId")
  async viewFileToken(@Req() req, @Res() res, @Param("fileId") fileId: string) {
    const fileInfo = await this.fsService.getFileInfo(fileId)
    if (!(req.user.role == "Admin" || req.user.role == "Staff") && fileInfo.owner != req.user.userId) {
      throw new HttpException("Unauthorized", HttpStatus.UNAUTHORIZED)
    } else {
      res.send({ token: this.fsService.generateViewFileToken(fileId) })
    }
  }

  @ApiNotFoundResponse({
    description: "Can't find the file info",
  })
  @ApiInternalServerErrorResponse({
    description: "This file is already deleted",
  })
  @ApiOkResponse({
    type: FileInfo,
  })
  @UseGuards(StaffGuard)
  @Delete("admin/delete/:fileId")
  async deleteFileAdmin(@Req() req, @Param("fileId") fileId: string) {
    const fileInfo = await this.fsService.getFileInfo(fileId)
    await this.fsService.deleteFile(fileInfo._id)
    return fileInfo
  }

  @ApiParam({
    name: "userId",
    description: "Id of the other user which will own the uploaded files",
  })
  @ApiInternalServerErrorResponse({
    description: "Can't upload file ( likely caused by insufficient write permission )",
  })
  @ApiNotFoundResponse({
    description: "Can't find the user",
  })
  @UseGuards(StaffGuard)
  @Post("admin/upload/:userId")
  @UseInterceptors(FileFieldsInterceptor(FSController.fileUploadConfig, { limits: { fileSize: FSController.maxFileSize } }))
  async uploadFileAdmin(@UploadedFiles() files, @Req() req, @Res() res, @Param("userId") userId: string) {
    res.send(await this.fsService.saveFiles(this.configService.get("UPLOAD_DEST"), userId, files, true))
  }

  @ApiParam({
    name: "userId",
    description: "Id of the satit user which will own the uploaded files",
  })
  @ApiInternalServerErrorResponse({
    description: "Can't upload file ( likely caused by insufficient write permission )",
  })
  @ApiNotFoundResponse({
    description: "Can't find the user",
  })
  @UseGuards(StaffGuard)
  @Post("admin/uploadSatit/:userId")
  @UseInterceptors(FileFieldsInterceptor(FSController.fileUploadConfigSatit, { limits: { fileSize: FSController.maxFileSize } }))
  async uploadFileAdminSatit(@UploadedFiles() files, @Req() req, @Res() res, @Param("userId") userId: string) {
    res.send(await this.fsService.saveFilesSatit(this.configService.get("UPLOAD_DEST"), userId, files, true))
  }
}
