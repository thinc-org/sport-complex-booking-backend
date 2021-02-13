import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  Post,
  Put,
  Req,
  UseGuards,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from "@nestjs/common"
import { ApiNotFoundResponse, ApiOkResponse, ApiTags, ApiUnauthorizedResponse } from "@nestjs/swagger"
import { UserGuard } from "src/auth/jwt.guard"
import { UserDTO } from "../dto/user.dto"
import { UsersService } from "../users.service"
import { ChangePasswordDTO } from "./accountInfos.dto"

@ApiTags("account_info")
@ApiUnauthorizedResponse({ description: "Must be logged in user to use this endpoints" })
@UseGuards(UserGuard)
@Controller("account_info")
export class AccountInfosController {
  constructor(private readonly userService: UsersService) {}

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
  @Put()
  async editAccountInfo(@Req() req, @Body() body) {
    return new UserDTO(await this.userService.validateAndEditAccountInfo(req.user.userId, body, false))
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
}
