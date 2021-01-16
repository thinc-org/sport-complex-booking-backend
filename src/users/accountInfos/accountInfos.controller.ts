import { Body, Controller, Get, HttpException, HttpStatus, Post, Put, Req, UseGuards, UsePipes, ValidationPipe } from "@nestjs/common"
import { UserGuard } from "src/auth/jwt.guard"
import { UsersService } from "../users.service"
import { ChangePasswordDTO } from "./accountInfos.dto"

@UseGuards(UserGuard)
@Controller("account_info")
export class AccountInfosController {
  constructor(private readonly userService: UsersService) {}

  @Get()
  async getAccountInfo(@Req() req) {
    return await this.userService.findAndUpdateBan(req.user.userId)
  }

  @Put()
  async editAccountInfo(@Req() req, @Body() body) {
    return await this.userService.validateAndEditAccountInfo(req.user.userId, body, false)
  }

  @Post()
  async postAccountInfo(@Req() req, @Body() body) {
    return await this.userService.validateAndEditAccountInfo(req.user.userId, body, true)
  }

  @UsePipes(new ValidationPipe())
  @Post("/change_password")
  async changePassword(@Body() body: ChangePasswordDTO, @Req() req) {
    await this.userService.changePassword(req.user.userId, body.oldPassword, body.newPassword)
  }
}
