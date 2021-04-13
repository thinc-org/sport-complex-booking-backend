import { HttpException, HttpStatus, Injectable } from "@nestjs/common"
import { Model, Types } from "mongoose"
import { InjectModel } from "@nestjs/mongoose"
import * as bcrypt from "bcrypt"
import { SatitCuPersonelUser, OtherUser, User, Account, CuStudentUser } from "src/users/interfaces/user.interface"
import { UsersService } from "./../../users/users.service"
import { UserEditingDto, ChangingPasswordDto } from "./dto/editingDto"
import { FSService } from "src/fs/fs.service"

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
