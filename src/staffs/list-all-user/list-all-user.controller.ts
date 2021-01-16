import { Controller, Get, Post, Query, Patch, Put, Delete, Body, Param, Res, UseGuards, UsePipes, ValidationPipe } from "@nestjs/common"
import { StaffGuard } from "src/auth/jwt.guard"
import { AuthService } from "src/auth/auth.service"
import { CreateOtherUserDto, CreateSatitUserDto } from "src/staffs/dto/add-user.dto"
import { User, Account } from "src/users/interfaces/user.interface"
import { ListAllUserService } from "./list-all-user.service"
import { Types, isValidObjectId } from "mongoose"
import { HttpException, HttpStatus } from "@nestjs/common"
import { CuStudentUserEditingDto, SatitAndCuPersonelEditingDto, OtherUserEditingDto, ChangingPasswordDto } from "./dto/editingDto"

@UseGuards(StaffGuard)
@Controller("list-all-user")
export class listAllUserController {
  constructor(private readonly addUserService: ListAllUserService, private authService: AuthService) {}

  idValidityChecker(id: Types.ObjectId) {
    if (!isValidObjectId(id)) {
      throw new HttpException("Invalid ObjectId", HttpStatus.BAD_REQUEST)
    }
  }

  @Get("/id/:id")
  async getUser(@Param("id") id: Types.ObjectId): Promise<User> {
    this.idValidityChecker(id)
    const user = await this.addUserService.getUserById(id)
    return user
  }

  @Get("/filter")
  async filterUser(@Query() qparam): Promise<[number, User[]]> {
    return this.addUserService.filterUser(qparam)
  }

  @Post("/SatitUser")
  @UsePipes(new ValidationPipe({ transform: true }))
  async addSatitUser(@Body() createUserDto: CreateSatitUserDto, @Res() res) {
    await this.addUserService.createSatitUser(createUserDto)

    return res.status(201).json({
      statusCode: 201,
      message: "SatitUser added Successfully",
    })
  }

  @Post("/OtherUser")
  @UsePipes(new ValidationPipe({ transform: true }))
  async addOtherUser(@Body() createUserDto: CreateOtherUserDto, @Res() res) {
    await this.addUserService.createOtherUser(createUserDto)

    return res.status(201).json({
      statusCode: 201,
      message: "OtherUser added Successfully",
    })
  }

  @Delete("/:id")
  async deleteUser(@Param("id") id, @Res() res) {
    this.idValidityChecker(id)
    await this.addUserService.deleteUser(id)
    return res.status(201).json({
      statusCode: 201,
      message: "User deleted Successfully",
    })
  }

  @Patch("/unban/:id")
  async unbanById(@Param() param): Promise<User> {
    this.idValidityChecker(param.id)
    return this.addUserService.editById(param.id, { is_penalize: false, expired_penalize_date: null })
  }

  @Put("/custudent/:id")
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async editCuStudentById(@Param() param, @Body() body: CuStudentUserEditingDto): Promise<User> {
    this.idValidityChecker(param.id)
    return this.addUserService.editById(param.id, body, Account.CuStudent)
  }

  @Put("/satit/:id")
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async editSatitById(@Param() param, @Body() body: SatitAndCuPersonelEditingDto): Promise<User> {
    this.idValidityChecker(param.id)
    return this.addUserService.editById(param.id, body, Account.SatitAndCuPersonel)
  }

  @Put("/other/:id")
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async editOtherById(@Param() param, @Body() body: OtherUserEditingDto): Promise<User> {
    this.idValidityChecker(param.id)
    return this.addUserService.editById(param.id, body, Account.Other)
  }

  @Patch("/password/:id")
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async changePassWord(@Param() param, @Body() body: ChangingPasswordDto): Promise<User> {
    this.idValidityChecker(param.id)
    return this.addUserService.changePassWord(param.id, body)
  }
}
