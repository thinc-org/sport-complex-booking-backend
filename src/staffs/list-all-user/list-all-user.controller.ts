import { Controller, Get, Post, Query, Patch, Put, Delete, Body, Param, Res, UseGuards, UsePipes, ValidationPipe } from "@nestjs/common"
import { StaffGuard } from "src/auth/jwt.guard"
import { AuthService } from "src/auth/auth.service"
import { CreateOtherUserDto, CreateSatitUserDto } from "src/staffs/dto/add-user.dto"
import { User, Account } from "src/users/interfaces/user.interface"
import { ListAllUserService } from "./list-all-user.service"
import { Types, isValidObjectId } from "mongoose"
import { HttpException, HttpStatus } from "@nestjs/common"
import { CuStudentUserEditingDto, SatitAndCuPersonelEditingDto, OtherUserEditingDto, ChangingPasswordDto } from "./dto/editingDto"
import {
  ApiBearerAuth,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiTags,
  ApiUnauthorizedResponse,
  ApiBadRequestResponse,
  ApiConflictResponse,
} from "@nestjs/swagger"

@ApiBearerAuth()
@ApiTags("list-all-user")
@ApiUnauthorizedResponse({ description: "Must be a logged in staff to use this endpoints" })
@UseGuards(StaffGuard)
@Controller("list-all-user")
export class listAllUserController {
  constructor(private readonly addUserService: ListAllUserService, private authService: AuthService) {}

  idValidityChecker(id: Types.ObjectId) {
    if (!isValidObjectId(id)) {
      throw new HttpException("Invalid ObjectId", HttpStatus.BAD_REQUEST)
    }
  }

  @ApiBadRequestResponse({ description: "The user ID isn't invalid" })
  @ApiNotFoundResponse({ description: "Can't find user with specified id (inside the jwt)" })
  @ApiOkResponse({ description: "Return User account info" })
  @Get("/id/:id")
  async getUser(@Param("id") id: Types.ObjectId): Promise<User> {
    this.idValidityChecker(id)
    const user = await this.addUserService.getUserById(id)
    return user
  }

  @ApiOkResponse({ description: "Query User account info" })
  @Get("/filter")
  async filterUser(@Query() qparam): Promise<[number, User[]]> {
    return this.addUserService.filterUser(qparam)
  }

  @ApiBadRequestResponse({ description: "The given username or email is used" })
  @ApiBadRequestResponse({ description: "The user ID isn't invalid" })
  @ApiOkResponse({ description: "Add satit user" })
  @Post("/SatitUser")
  @UsePipes(new ValidationPipe({ transform: true }))
  async addSatitUser(@Body() createUserDto: CreateSatitUserDto, @Res() res) {
    await this.addUserService.createSatitUser(createUserDto)

    return res.status(201).json({
      statusCode: 201,
      message: "SatitUser added Successfully",
    })
  }

  @ApiNotFoundResponse({ description: "Can't find user with specified id (inside the jwt)" })
  @ApiBadRequestResponse({ description: "The user ID isn't invalid" })
  @ApiOkResponse({ description: "Delete user by id" })
  @Delete("/:id")
  async deleteUser(@Param("id") id, @Res() res) {
    this.idValidityChecker(id)
    await this.addUserService.deleteUser(id)
    return res.status(201).json({
      statusCode: 201,
      message: "User deleted Successfully",
    })
  }

  @ApiBadRequestResponse({ description: "Editing password is not allowed or The given user type is not like to the real user type" })
  @ApiNotFoundResponse({ description: "Can't find user with specified id (inside the jwt)" })
  @ApiBadRequestResponse({ description: "The given user type is not similar to the real type" })
  @ApiBadRequestResponse({ description: "The user ID isn't invalid" })
  @ApiOkResponse({ description: "Unban user by given id" })
  @Patch("/unban/:id")
  async unbanById(@Param() param): Promise<User> {
    this.idValidityChecker(param.id)
    return this.addUserService.editById(param.id, { is_penalize: false, expired_penalize_date: null })
  }

  @ApiBadRequestResponse({ description: "Editing password is not allowed or The given user type is not like to the real user type" })
  @ApiNotFoundResponse({ description: "Can't find user with specified id (inside the jwt)" })
  @ApiBadRequestResponse({ description: "The given user type is not similar to the real type" })
  @ApiBadRequestResponse({ description: "The user ID isn't invalid" })
  @ApiOkResponse({ description: "Edit cu student by given id" })
  @Put("/custudent/:id")
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async editCuStudentById(@Param() param, @Body() body: CuStudentUserEditingDto): Promise<User> {
    this.idValidityChecker(param.id)
    return this.addUserService.editById(param.id, body, Account.CuStudent)
  }

  @ApiBadRequestResponse({ description: "Editing password is not allowed or The given user type is not like to the real user type" })
  @ApiNotFoundResponse({ description: "Can't find user with specified id (inside the jwt)" })
  @ApiBadRequestResponse({ description: "The given user type is not similar to the real type" })
  @ApiBadRequestResponse({ description: "The user ID isn't invalid" })
  @ApiOkResponse({ description: "Edit satit student by given id" })
  @Put("/satit/:id")
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async editSatitById(@Param() param, @Body() body: SatitAndCuPersonelEditingDto): Promise<User> {
    this.idValidityChecker(param.id)
    return this.addUserService.editById(param.id, body, Account.SatitAndCuPersonel)
  }

  @ApiBadRequestResponse({ description: "Editing password is not allowed or The given user type is not like to the real user type" })
  @ApiNotFoundResponse({ description: "Can't find user with specified id (inside the jwt)" })
  @ApiBadRequestResponse({ description: "The given user type is not similar to the real type" })
  @ApiBadRequestResponse({ description: "The user ID isn't invalid" })
  @ApiOkResponse({ description: "Edit other student by given id" })
  @Put("/other/:id")
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async editOtherById(@Param() param, @Body() body: OtherUserEditingDto): Promise<User> {
    this.idValidityChecker(param.id)
    return this.addUserService.editById(param.id, body, Account.Other)
  }

  @ApiBadRequestResponse({ description: "Chula student's password is not able to changed" })
  @ApiNotFoundResponse({ description: "Can't find user with specified id (inside the jwt)" })
  @ApiBadRequestResponse({ description: "The user ID isn't invalid" })
  @ApiConflictResponse({ description: "The given body doesn't exist password property" })
  @ApiOkResponse({ description: "Change user's password by given id" })
  @Patch("/password/:id")
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async changePassWord(@Param() param, @Body() body: ChangingPasswordDto): Promise<User> {
    this.idValidityChecker(param.id)
    return this.addUserService.changePassWord(param.id, body)
  }
}
