import { HttpException, HttpStatus, Injectable } from "@nestjs/common"
import { Model, Types, FilterQuery } from "mongoose"
import { InjectModel } from "@nestjs/mongoose"
import * as bcrypt from "bcrypt"
import { SatitCuPersonelUser, OtherUser, User, Account, CuStudentUser } from "src/users/interfaces/user.interface"
import { UsersService } from "./../../users/users.service"
import { UserEditingDto, ChangingPasswordDto } from "./dto/editingDto"
import { FSService } from "src/fs/fs.service"

type FilterUserAllTypes = FilterQuery<User> & FilterQuery<SatitCuPersonelUser> & FilterQuery<OtherUser> & FilterQuery<CuStudentUser>

@Injectable()
export class ListAllUserService {
  constructor(
    @InjectModel("SatitCuPersonel") private satitStudentModel: Model<SatitCuPersonelUser>,
    @InjectModel("Other") private otherUserModel: Model<OtherUser>,
    @InjectModel("CuStudent") private cuStudentModel: Model<CuStudentUser>,
    @InjectModel("User") private userModel: Model<User>,
    private readonly usersService: UsersService,
    private readonly fsService: FSService
  ) {}

  async hashPassword(password: string): Promise<string> {
    return await bcrypt.hash(password, Number(process.env.HASH_SALT))
  }

  isThaiLang(keyword: string) {
    return !("A" <= keyword.charAt(0) && keyword.charAt(0) <= "z")
  }

  isEngLang(keyword: string) {
    return "A" <= keyword.charAt(0) && keyword.charAt(0) <= "z"
  }

  //This method has a role to filter from the properties that front-end require but some property of the requirement isn't the property of User.
  //So the property extraction is neccessary.
  async filterUser(qparam): Promise<[number, User[]]> {
    let begin = 0
    let end: number = null

    const orClauses = []
    const filter: FilterUserAllTypes = {}

    //Begin and end are the slicing numbers of the array.
    if (qparam.hasOwnProperty("begin")) {
      begin = qparam.begin
    }

    if (qparam.hasOwnProperty("end")) {
      end = qparam.end
    }

    //.name isn't the property of uesr. So .name is changed to .name_th or .name_en
    if (qparam.hasOwnProperty("name")) {
      const field = this.isThaiLang(qparam.name) ? "name_th" : "name_en"
      filter[field] = { $regex: "^" + qparam.name + ".*", $options: "i" }
    }

    if (qparam.hasOwnProperty("surname")) {
      const field = this.isThaiLang(qparam.surname) ? "surname_th" : "surname_en"
      filter[field] = { $regex: "^" + qparam.surname + ".*", $options: "i" }
    }

    if (qparam.hasOwnProperty("is_penalize")) {
      filter.is_penalize = qparam.is_penalize === "true"
    }

    if (qparam.hasOwnProperty("is_expired")) {
      if (qparam.is_expired === "true") {
        filter.account_expiration_date = { $lt: new Date() }
      } else {
        orClauses.push({ account_expiration_date: null })
        orClauses.push({ account_expiration_date: { $gt: new Date() } })
      }
    }

    if (orClauses.length > 0) {
      filter.$or = orClauses
    }
    //All property
    const seletedProperty = "username is_penalize name_th surname_th name_en surname_en account_expiration_date"
    const users: User[] = await this.usersService.find(filter, seletedProperty)
    const current: Date = new Date()

    if (end === null) {
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

  async deleteUser(id: Types.ObjectId): Promise<User> {
    const deleteResponse = await this.userModel.findByIdAndRemove(id)
    if (!deleteResponse) {
      throw new HttpException("User not found", HttpStatus.NOT_FOUND)
    }
    await this.fsService.deleteUserFiles(deleteResponse)
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

    this.deleteFileInfo(update)
    Object.assign(user, update)

    user.save()

    return user
  }

  // file infomation will only be updated by fs endpoints
  private deleteFileInfo(update) {
    const keys = [
      "user_photo",
      "medical_certificate",
      "national_id_house_registration",
      "relationship_verification_document",
      "payment_slip",
      "student_card_photo",
      "previous_payment_slips",
      "previous_student_card_photo",
    ]
    for (const key of keys) delete update[key]
  }

  async changePassWord(id: Types.ObjectId, body: ChangingPasswordDto): Promise<User> {
    const user: User = await this.getUserById(id)

    if (!body.hasOwnProperty("password")) {
      throw new HttpException("The body doesn't exist a password.", HttpStatus.CONFLICT)
    }

    if (user === null) {
      throw new HttpException("Invalid User", HttpStatus.NOT_FOUND)
    }

    const type = user.account_type
    const newHashPassWord: string = await this.hashPassword(body["password"])

    if (type === Account.SatitAndCuPersonel) {
      ;(user as SatitCuPersonelUser).password = newHashPassWord
    } else if (type === Account.Other) {
      ;(user as OtherUser).password = newHashPassWord
    } else {
      throw new HttpException("This user can't change passowrd.", HttpStatus.BAD_REQUEST)
    }

    user.save()
    return user
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
