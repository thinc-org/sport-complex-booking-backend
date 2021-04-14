import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Post,
  Put,
  Req,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from "@nestjs/common"
import { FileFieldsInterceptor } from "@nestjs/platform-express"
import { ApiBearerAuth, ApiNotFoundResponse, ApiOkResponse, ApiTags, ApiUnauthorizedResponse } from "@nestjs/swagger"
import { UserGuard } from "src/auth/jwt.guard"
import { FSController } from "src/fs/fs.controller"
import { UploadedFilesOther, UploadedFilesSatit } from "src/fs/fs.interface"
import { FSService } from "src/fs/fs.service"
import { UserDTO } from "../dto/user.dto"
import { User } from "../interfaces/user.interface"
import { UsersService } from "../users.service"
import { ChangePasswordDTO } from "./accountInfos.dto"

@ApiBearerAuth()
@ApiTags("account_info")
@ApiUnauthorizedResponse({ description: "Must be a logged in user to use this endpoints" })
@UseGuards(UserGuard)
@Controller("account_info")
export class AccountInfosController {
  constructor(private readonly userService: UsersService, private readonly fsService: FSService) {}

  @UseInterceptors(ClassSerializerInterceptor)
  @ApiNotFoundResponse({ description: "Can't find user with specified id (inside the jwt)" })
  @ApiOkResponse({ description: "Return User account info" })
  @Get()
  async getAccountInfo(@Req() req) {
    return new UserDTO(await this.userService.findAndUpdateBan(req.user.userId))
  }

  @ApiNotFoundResponse({ description: "Can't find user with specified id specified id (inside the jwt)" })
  @ApiOkResponse({ description: "Return Updated account info" })
  @UseInterceptors(ClassSerializerInterceptor)
  @UseInterceptors(FileFieldsInterceptor(FSController.fileUploadConfigAll, { limits: { fileSize: FSController.maxFileSize } }))
  @Put()
  async editAccountInfo(@UploadedFiles() files: UploadedFilesOther & UploadedFilesSatit, @Req() req, @Body() body) {
    const updt = this.deserializeJSON(body.data)
    const user = await this.userService.findById(req.user.userId, "-password")
    if (files != null) await this.createFileAndUpdateUser(user, files)
    return new UserDTO(await this.userService.validateAndEditAccountInfo(user, updt, false))
  }

  private async createFileAndUpdateUser(user: User, files: UploadedFilesOther & UploadedFilesSatit) {
    const uploadable = user.uploadableFileTypes()
    for (const fileType of Object.keys(files)) {
      if (!uploadable.includes(fileType)) continue
      const fileInfo = await this.fsService.createFile(user, files[fileType][0], fileType)
      if (fileInfo != null) {
        const oldFileInfo = user.updateFileInfo(fileInfo)
        this.fsService.removeFile(oldFileInfo.toHexString())
      }
    }
  }

  @ApiNotFoundResponse({ description: "Can't find user with specified id specified id (inside the jwt)" })
  @ApiOkResponse({ description: "Return Updated account info" })
  @UseInterceptors(ClassSerializerInterceptor)
  @Post()
  async postAccountInfo(@Req() req, @Body() body) {
    return new UserDTO(await this.userService.validateAndEditAccountInfo(req.user.userId, body, true))
  }

  @ApiNotFoundResponse({ description: "Can't find user with specified id specified id (inside the jwt)" })
  @ApiOkResponse({ description: "Changed the password" })
  @ApiUnauthorizedResponse({ description: "Password does not match" })
  @UsePipes(new ValidationPipe())
  @Post("/change_password")
  async changePassword(@Body() body: ChangePasswordDTO, @Req() req) {
    await this.userService.changePassword(req.user.userId, body.oldPassword, body.newPassword)
  }

  private deserializeJSON(data: string): unknown {
    let updt = null
    try {
      updt = JSON.parse(data)
      return updt
    } catch (err) {
      throw new HttpException(
        {
          status: 400,
          message: ["Invalid json data"],
          error: "Bad Request",
        },
        HttpStatus.BAD_REQUEST
      )
    }
  }
}
