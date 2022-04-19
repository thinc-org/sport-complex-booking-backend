import { BadRequestException, Injectable, HttpStatus, HttpException, NotFoundException } from "@nestjs/common"
import { Account, CuStudentUser, OtherUser, SatitCuPersonelUser, User } from "./interfaces/user.interface"
import { Model, isValidObjectId, Types } from "mongoose"
import * as bcrypt from "bcrypt"
import { InjectModel } from "@nestjs/mongoose"
import { SsoContent } from "./interfaces/sso.interface"
import { AuthService } from "src/auth/auth.service"
import { CreateOtherUserDTO, CreateSatitUserDto } from "./dto/user.dto"
import { plainToClass } from "class-transformer"
import { validate, ValidationError } from "class-validator"
import { PopulatedReservation, PopulatedWaitingRoom, Reservation, WaitingRoom } from "src/reservation/interfaces/reservation.interface"
import { Cron } from "@nestjs/schedule"

@Injectable()
export class UsersService {
  constructor(
    @InjectModel("User") private userModel: Model<User>,
    @InjectModel("CuStudent") private cuStudentModel: Model<CuStudentUser>,
    @InjectModel("SatitCuPersonel") private satitStudentModel: Model<SatitCuPersonelUser>,
    @InjectModel("Other") private otherUserModel: Model<OtherUser>,
    @InjectModel("WaitingRoom") private waitingRoomModel: Model<WaitingRoom>,
    @InjectModel("Reservation") private reservationModel: Model<Reservation>,
    private authService: AuthService
  ) {}

  async validateAndEditAccountInfo(userOrId: string | User, updt, full: boolean): Promise<User> {
    let user = null
    if (typeof userOrId == "string") {
      user = await this.findById(userOrId as string)
    } else {
      user = userOrId as User
    }
    await user.validateAndEditAccountInfo(updt, full)
    try {
      return await user.save()
    } catch (err) {
      if (err.code === 11000) {
        const duplicateKey = Object.keys(err.keyPattern)[0]
        throw new HttpException(
          {
            statusCode: HttpStatus.BAD_REQUEST,
            message: duplicateKey + " is already used",
            duplicateKey,
          },
          HttpStatus.BAD_REQUEST
        )
      }
    }
  }

  async changePassword(userId: string, oldPassword: string, newPassword: string) {
    const user = await this.findById(userId)
    const isMatched = await this.authService.comparePassword(oldPassword, user.getPassword())

    if (!isMatched) throw new HttpException("old password does not match", HttpStatus.UNAUTHORIZED)

    user.setPassword(await this.authService.hashPassword(newPassword))
    await user.save()
  }

  async findByUsername(username: string): Promise<User> {
    const user = await this.userModel.findOne({ username: username })
    return user
  }

  async findCUById(id: string): Promise<CuStudentUser> {
    if (!isValidObjectId(id)) {
      throw new HttpException("Invalid Id", HttpStatus.BAD_REQUEST)
    }
    const acc = await this.cuStudentModel.findOne({ _id: id })
    if (!acc) {
      throw new NotFoundException("This Id does not exist.")
    }
    //return an item that has its id matches to the parameter
    return acc
  }

  async findSatitByid(id: string): Promise<SatitCuPersonelUser> {
    if (!isValidObjectId(id)) {
      throw new BadRequestException("Invalid Id")
    }
    const user = await this.satitStudentModel.findOne({ _id: id })
    return user
  }

  async findOtherByid(id: string): Promise<OtherUser> {
    const user = await this.otherUserModel.findOne({ _id: id })
    return user
  }

  async findById(id: Types.ObjectId | string, select?: string): Promise<User> {
    if (!isValidObjectId(id)) {
      throw new BadRequestException("Invalid Id")
    }
    const user = await this.userModel.findById(id).select(select)
    if (user == null) {
      throw new HttpException(
        {
          reason: "USER_NOT_FOUND",
          message: "User not found",
        },
        HttpStatus.NOT_FOUND
      )
    }
    return user
  }

  async findAndUpdateBan(id: Types.ObjectId | string): Promise<User> {
    const user = await this.findById(id, "-password")
    user.updateBan()
    return user
  }

  @Cron("0 * * * * *")
  async updateBanAll() {
    await this.userModel.updateMany(
      { is_penalize: true, expired_penalize_date: { $lt: new Date() } }, // if is_penalize is true and expired_penalize_date is less than current date
      { is_penalize: false, expired_penalize_date: null } // then remove ban
    )
  }

  async find(filter, select?: string, account_type?: Account): Promise<User[]> {
    let model: Model<User> | Model<CuStudentUser> | Model<SatitCuPersonelUser> | Model<OtherUser>
    switch (account_type) {
      case Account.CuStudent:
        model = this.cuStudentModel
        break
      case Account.Other:
        model = this.otherUserModel
        break
      case Account.SatitAndCuPersonel:
        model = this.satitStudentModel
        break
      default:
        model = this.userModel
        break
    }
    return await model.find(filter).select(select)
  }

  async ban(id: Types.ObjectId, bannedDay: number, removeReservations = false) {
    await this.updateBanAll()
    const bannedDate = new Date()
    bannedDate.setDate(bannedDate.getDate() + bannedDay)

    const user = await this.findById(id)
    await this.userModel.findByIdAndUpdate(id, { is_penalize: true, expired_penalize_date: bannedDate })

    if (removeReservations) {
      const reservations = ((await this.reservationModel.find({ list_member: id }).populate("list_member")) as unknown) as PopulatedReservation[]
      for (const reservation of reservations) {
        if (reservation.list_member.every((member) => member.is_penalize)) {
          await reservation.remove()
        }
      }
      const waitingrooms = ((await this.waitingRoomModel.find({ list_member: id }).populate("list_member")) as unknown) as PopulatedWaitingRoom[]
      for (const waitingroom of waitingrooms) {
        if (waitingroom.list_member.every((member) => member.is_penalize)) {
          await waitingroom.remove()
        }
      }
    }

    return user
  }

  async login(username: string, password: string): Promise<string> {
    //if username is not exist
    let isPasswordMatching = false
    let user = null
    const isUsernameExist = await this.findByUsername(username)
    if (!isUsernameExist) {
      throw new BadRequestException("Username or Password is wrong")
    }

    if (isUsernameExist.account_type == "SatitAndCuPersonel") {
      user = await this.findSatitByid(isUsernameExist._id)
      isPasswordMatching = await bcrypt.compare(password, user.password)
    } else {
      user = await this.findOtherByid(isUsernameExist._id)
      isPasswordMatching = await bcrypt.compare(password, user.password)
    }

    if (!isPasswordMatching) {
      throw new BadRequestException("Username or Password is wrong")
    }
    return user
  }

  //not using any will return as observable, don't know how to
  async create_fromSso(ssoReturn: SsoContent): Promise<CuStudentUser> {
    const newAccount = new this.cuStudentModel({
      is_thai_language: true,
      name_th: ssoReturn["firstnameth"],
      surname_th: ssoReturn["lastnameth"],
      name_en: ssoReturn["firstname"],
      surname_en: ssoReturn["lastname"],
      username: ssoReturn["username"],
      personal_email: "",
      is_penalize: false,
      is_first_login: true,
      phone: "",
    })
    const acc = await newAccount.save()
    return acc
  }

  //for change email, language, phone number (send all 3 variable for each change)
  async changeData(input: { is_thai_language: boolean; personal_email: string; phone: string }, id: string) {
    //check if db has personal_email yet
    if (input.personal_email == "") throw new BadRequestException("Please enter email.")
    const acc = await this.findCUById(id)
    acc.is_thai_language = input.is_thai_language
    acc.personal_email = input.personal_email
    acc.phone = input.phone
    acc.is_first_login = false
    acc.save()
    return acc
  }

  async changeLanguage(is_thai_language: boolean, id: string) {
    const user = await this.findById(id)
    user.is_thai_language = is_thai_language
    return await user.save()
  }

  async validateOtherUserData(jsonstring: string): Promise<CreateOtherUserDTO> {
    const user = plainToClass(CreateOtherUserDTO, JSON.parse(jsonstring))
    const err = await validate(user)
    if (err.length > 0) {
      this.handleValidatonError(err)
    }
    return user
  }

  async validateSatitUserData(jsonstring: string): Promise<CreateSatitUserDto> {
    const user = plainToClass(CreateSatitUserDto, JSON.parse(jsonstring))
    const err = await validate(user)
    if (err.length > 0) {
      this.handleValidatonError(err)
    }
    return user
  }

  private handleValidatonError(err: ValidationError[]) {
    const message = []
    err.forEach((e) => message.push(...Object.values(e.constraints)))
    throw new HttpException(
      {
        status: 400,
        message,
        error: "Bad Request",
      },
      HttpStatus.BAD_REQUEST
    )
  }

  async createOtherUser(user: CreateOtherUserDTO): Promise<[OtherUser, string]> {
    const newUser = new this.otherUserModel(user)
    newUser.document_status = "NotSubmitted"
    newUser.password = await this.authService.hashPassword(user.password)
    newUser.is_penalize = false
    newUser.expired_penalize_date = null
    try {
      return [await newUser.save(), this.authService.generateJWT(newUser._id, "User")]
    } catch (err) {
      if (err.code === 11000) {
        const duplicateKey = Object.keys(err.keyPattern)[0]
        throw new HttpException(
          {
            statusCode: HttpStatus.BAD_REQUEST,
            message: duplicateKey + " is already used",
            duplicateKey,
          },
          HttpStatus.BAD_REQUEST
        )
      }
    }
  }

  async findUserByUsername(username: string): Promise<User> {
    const user = await this.userModel.findOne({ username: username })
    return user
  }

  async createSatitUser(user: CreateSatitUserDto): Promise<[SatitCuPersonelUser, string]> {
    //if username already exist
    const isUsernameExist = await this.findUserByUsername(user.username)
    if (isUsernameExist) {
      throw new HttpException("Username already exist", HttpStatus.BAD_REQUEST)
    }

    //hash pasword
    const newUser = new this.satitStudentModel(user)
    newUser.password = await this.authService.hashPassword(user.password)
    newUser.is_penalize = false
    newUser.expired_penalize_date = null
    newUser.document_status = "NotSubmitted"
    //create user
    return [await newUser.save(), await this.authService.generateJWT(newUser._id, "User")]
  }
}
