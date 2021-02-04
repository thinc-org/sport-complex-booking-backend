import { HttpException, HttpStatus, Injectable } from "@nestjs/common"
import { Model, Types } from "mongoose"
import { InjectModel } from "@nestjs/mongoose"
import * as bcrypt from "bcrypt"
import { SatitCuPersonelUser, OtherUser, User, Account, CuStudentUser } from "src/users/interfaces/user.interface"
import { UsersService } from "./../../users/users.service"
import { UserEditingDto, ChangingPasswordDto } from "./dto/editingDto"
import { CreateOtherUserDto, CreateSatitUserDto } from "../dto/add-user.dto"

@Injectable()
export class ListAllUserService {
  constructor(
    @InjectModel("SatitCuPersonel") private satitStudentModel: Model<SatitCuPersonelUser>,
    @InjectModel("Other") private otherUserModel: Model<OtherUser>,
    @InjectModel("CuStudent") private cuStudentModel: Model<CuStudentUser>,
    @InjectModel("User") private userModel: Model<User>,
    private readonly usersService: UsersService
  ) { }

  async hashPassword(password: string): Promise<string> {
    return await bcrypt.hash(password, Number(process.env.HASH_SALT))
  }

  isThaiLang(keyword: string) {
    return !("A" <= keyword.charAt(0) && keyword.charAt(0) <= "z")
  }

  isEngLang(keyword: string) {
    return ("A" <= keyword.charAt(0) && keyword.charAt(0) <= "z")
  }

  //This method has a role to filter from the properties that front-end require but some property of the requirement isn't the property of User.
  //So the property extraction is neccessary.
  async filterUser(qparam): Promise<[number, User[]]> {
    let begin = 0,
      end: number,
      is_thai_language = false,
      has_end = false

    //Begin and end are the slicing numbers of the array.
    if (qparam.hasOwnProperty("begin")) {
      begin = qparam.begin
      delete qparam["begin"]
    }

    if (qparam.hasOwnProperty("end")) {
      end = qparam.end
      has_end = true
      delete qparam["end"]
    }

    const seletedProperty = "username is_penalize name_th surname_th name_en surname_en"
    //.name isn't the property of uesr. So .name is changed to .name_th or .name_en
    if (qparam.hasOwnProperty("name")) {
      is_thai_language = this.isThaiLang(qparam.name)

      if (is_thai_language) {
        qparam.name_th = { $regex: "^" + qparam.name + ".*", $options: "i" }
      } else {
        qparam.name_en = { $regex: "^" + qparam.name + ".*", $options: "i" }
      }
    }

    if (qparam.hasOwnProperty("surname")) {
      is_thai_language = this.isThaiLang(qparam.surname)

      if (is_thai_language) {
        qparam.surname_th = { $regex: "^" + qparam.surname + ".*", $options: "i" }
      } else {
        qparam.surname_en = { $regex: "^" + qparam.surname + ".*", $options: "i" }
      }
    }

    delete qparam["name"]
    delete qparam["surname"]

    //All property
    const users: User[] = await this.usersService.find(qparam, seletedProperty)
    const current: Date = new Date()

    if (!has_end) {
      end = users.length
    } else {
      if (end > users.length) {
        end = users.length
      }
    }

    for (let i = begin; i < end; i++) {
      this.updatePenalizationState(users[i], current)
    }

    return [users.length, users.slice(begin, end)]
  }

  async findUserByUsername(username: string): Promise<User> {
    const user = await this.userModel.findOne({ username: username })
    return user
  }
  async getUserById(id: Types.ObjectId): Promise<User> {
    const user: User = await this.userModel.findById(id)
    const current: Date = new Date()

    if (user === null) {
      throw new HttpException("Invalid User", HttpStatus.NOT_FOUND)
    }

    this.updatePenalizationState(user, current)

    return user
  }

  async findUserByEmail(email: string): Promise<User> {
    const user = await this.userModel.findOne({ personal_email: email })
    return user
  }

  async createSatitUser(user: CreateSatitUserDto) {
    //if username already exist
    const isUsernameExist = await this.findUserByUsername(user.username)
    if (isUsernameExist) {
      throw new HttpException("Username already exist", HttpStatus.BAD_REQUEST)
    }

    const isEmailExist = await this.findUserByEmail(user.personal_email)
    if (isEmailExist) {
      throw new HttpException("This Email is already used", HttpStatus.BAD_REQUEST)
    }

    //hash pasword
    const newUser = new this.satitStudentModel(user)
    newUser.password = await this.hashPassword(user.password)
    newUser.is_penalize = false
    newUser.expired_penalize_date = null
    //create user
    await newUser.save()
  }

  async deleteUser(id: Types.ObjectId): Promise<User> {
    const deleteResponse = await this.userModel.findByIdAndRemove(id)
    if (!deleteResponse) {
      throw new HttpException("User not found", HttpStatus.NOT_FOUND)
    }
    return deleteResponse
  }

  async editById(id: Types.ObjectId, update: UserEditingDto, account_type?: Account): Promise<User> {
    const user: User = await this.userModel.findById(id)

    if (update.hasOwnProperty("password")) {
      throw new HttpException("Editing password isnt allowed.", HttpStatus.BAD_REQUEST)
    }

    if (user === null) {
      throw new HttpException("Invalid User", HttpStatus.NOT_FOUND)
    }

    if (account_type && account_type !== user.account_type) {
      throw new HttpException("User isn't " + account_type, HttpStatus.BAD_REQUEST)
    }

    Object.assign(user, update)

    user.save()

    return user
  }

  async changePassWord(id: Types.ObjectId, body: ChangingPasswordDto): Promise<User> {
    const tempUser: User = await this.getUserById(id)

    if (!body.hasOwnProperty("password")) {
      throw new HttpException("The body doesn't exist a password.", HttpStatus.CONFLICT)
    }

    const type = tempUser.account_type
    const newHashPassWord: string = await this.hashPassword(body["password"])

    if (type === Account.SatitAndCuPersonel) {
      ; (tempUser as SatitCuPersonelUser).password = newHashPassWord
    } else if (type === Account.Other) {
      ; (tempUser as OtherUser).password = newHashPassWord
    } else {
      throw new HttpException("This user can't change passowrd.", HttpStatus.BAD_REQUEST)
    }

    tempUser.save()
    return tempUser
  }

  updatePenalizationState(user: User, current: Date) {
    if (user.is_penalize) {
      if (current > user.expired_penalize_date) {
        user.is_penalize = false
        user.expired_penalize_date = null
        user.save()
      }
    }
  }
}
