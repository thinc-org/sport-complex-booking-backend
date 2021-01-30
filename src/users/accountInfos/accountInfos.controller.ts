import { Body, ClassSerializerInterceptor, Controller, Get, Post, Put, Req, UseGuards, UseInterceptors, UsePipes, ValidationPipe } from "@nestjs/common"
import { UserGuard } from "src/auth/jwt.guard"
import { UserDTO } from "../dto/user.dto"
import { UsersService } from "../users.service"
import { ChangePasswordDTO } from "./accountInfos.dto"

@UseGuards(UserGuard)
@Controller("account_info")
export class AccountInfosController {
  constructor(private readonly userService: UsersService) { }

  @UseInterceptors(ClassSerializerInterceptor)
  @Get()
  async getAccountInfo(@Req() req) {
    return new UserDTO(await this.userService.findAndUpdateBan(req.user.userId));
  }

  @UseInterceptors(ClassSerializerInterceptor)
  @Put()
  async editAccountInfo(@Req() req, @Body() body) {
    return new UserDTO(await this.userService.validateAndEditAccountInfo(req.user.userId, body, false));
  }

  @UseInterceptors(ClassSerializerInterceptor)
  @Post()
  async postAccountInfo(@Req() req, @Body() body) {
    return new UserDTO(await this.userService.validateAndEditAccountInfo(req.user.userId, body, true));
  }

  @UsePipes(new ValidationPipe())
  @Post("/change_password")
  async changePassword(@Body() body: ChangePasswordDTO, @Req() req) {
    await this.userService.changePassword(req.user.userId, body.oldPassword, body.newPassword)
  }
}
