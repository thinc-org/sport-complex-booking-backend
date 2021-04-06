import { HttpException, HttpStatus } from "@nestjs/common"
import { plainToClass } from "class-transformer"
import { validateOrReject } from "class-validator"
import * as mongoose from "mongoose"
import { editOtherAccountInfoDTO, editSatitAccountInfoDTO, EditUserInfoDTO } from "../accountInfos/accountInfos.dto"
import { OtherUser, SatitCuPersonelUser, Verification } from "../interfaces/user.interface"

const verificationSchemaType = { type: String, enum: ["NotSubmitted", "Submitted", "Verified", "Rejected"] }

class UserSchemaClass extends mongoose.Schema {
  constructor(definition?: mongoose.SchemaDefinition) {
    super(definition, { discriminatorKey: "account_type" })
    this.add({
      is_thai_language: Boolean,
      is_penalize: Boolean,
      expired_penalize_date: Date,
      phone: String,
      personal_email: String,
      name_en: String,
      surname_en: String,
      name_th: String,
      surname_th: String,
      username: String,
    })

    this.statics.editAccountInfoDTO = EditUserInfoDTO

    this.methods.editAccountInfo = function (updt: EditUserInfoDTO) {
      this.is_thai_language = updt.is_thai_language ?? this.is_thai_language
      this.personal_email = updt.personal_email ?? this.personal_email
      this.phone = updt.phone ?? this.phone
    }

    this.methods.validateAndEditAccountInfo = async function (updt, all: boolean) {
      const Model = this.constructor
      const info = plainToClass(Model.editAccountInfoDTO, updt, { excludeExtraneousValues: true })
      try {
        await validateOrReject(info, { groups: [all ? "all" : "optional"], validationError: { target: false } })
        this.editAccountInfo(info)
      } catch (err) {
        throw new HttpException(err, HttpStatus.BAD_REQUEST)
      }
    }

    this.methods.setPassword = function (hashedPassword: string) {
      this.password = hashedPassword
    }

    this.methods.getPassword = function () {
      if (this.password) return this.password
      else throw new HttpException("password does not exist", HttpStatus.INTERNAL_SERVER_ERROR)
    }

    this.methods.updateBan = function () {
      if (!this.is_penalize) {
        return
      } else if (this.expired_penalize_date == null) {
        this.is_penalize = false
      } else if (new Date() > this.expired_penalize_date) {
        this.is_penalize = false
        this.expired_penalize_date = null
      }
    }
  }

  protected static assignNotNull(target, ...sources) {
    for (const source of sources) {
      for (const key of Object.keys(source)) {
        const val = source[key]
        if (val != null) {
          if (target[key] === undefined || val instanceof Array || !(val instanceof Object)) target[key] = val
          else UserSchemaClass.assignNotNull(target[key], val)
        }
      }
    }
    return target
  }
}

export const UserSchema = new UserSchemaClass()
UserSchema.index({ username: 1 }, { unique: true })

class CuStudentSchemaClass extends UserSchemaClass {
  constructor() {
    super({ is_first_login: Boolean })
    this.methods.setPassword = function () {
      throw new HttpException("Custudent cannot change password", HttpStatus.FORBIDDEN)
    }
    this.methods.getPassword = function () {
      throw new HttpException("Custudent does not have password", HttpStatus.FORBIDDEN)
    }

    const oldEditMethod: (dto: any) => void = this.methods.editAccountInfo

    this.methods.editAccountInfo = function (updt: EditUserInfoDTO) {
      oldEditMethod.call(this, updt)
      this.is_first_login = false
    }
  }
}

export const CuStudentSchema = new CuStudentSchemaClass()

class SatitCuPersonelSchemaClass extends UserSchemaClass {
  constructor() {
    super({
      password: String,
      verification_status: verificationSchemaType,
      rejected_info: [String],
      account_expiration_date: Date,
      document_status: { type: String, enum: ["NotSubmitted", "Submitted", "Rejected"] },
      student_card_photo: { type: mongoose.Schema.Types.ObjectId, ref: "FileInfo" },
      previous_student_card_photo: [{ type: mongoose.Schema.Types.ObjectId, ref: "FileInfo" }],
    })

    this.statics.editAccountInfoDTO = editSatitAccountInfoDTO

    const oldEditMethod: (dto: any) => void = this.methods.editAccountInfo

    this.methods.editAccountInfo = function(this: SatitCuPersonelUser, updt: editSatitAccountInfoDTO) {
      oldEditMethod.call(this, updt)
      UserSchemaClass.assignNotNull(this, updt)
      if (this.verification_status == "Rejected") {
        UserSchemaClass.assignNotNull(this, updt, { verification_status: "Submitted", rejected_info: [] })
      }
    }
  }
}

export const SatitCuPersonelSchema = new SatitCuPersonelSchemaClass()

class OtherSchemaClass extends UserSchemaClass {
  constructor() {
    super({
      prefix: String, //(เพื่อแสดง นาย/นาง/นางสาว)
      birthday: Date, //(use this for cal age)
      national_id: String, //(also pasport no in foreign)
      gender: String,
      marital_status: String,
      address: String,
      home_phone: String,
      contact_person: {
        contact_person_prefix: String,
        contact_person_name: String,
        contact_person_surname: String,
        contact_person_home_phone: String,
        contact_person_phone: String,
      },
      medical_condition: String,
      membership_type: String,
      password: String, //pass=phone(editable)
      verification_status: verificationSchemaType,
      rejected_info: [String],
      account_expiration_date: Date,
      document_status: { type: String, enum: ["NotSubmitted", "Submitted", "Rejected"] },
      user_photo: { type: mongoose.Schema.Types.ObjectId, ref: "FileInfo" }, //(ของcollectionที่เก็บรูป)
      medical_certificate: { type: mongoose.Schema.Types.ObjectId, ref: "FileInfo" },
      national_id_house_registration: { type: mongoose.Schema.Types.ObjectId, ref: "FileInfo" },
      relationship_verification_document: { type: mongoose.Schema.Types.ObjectId, ref: "FileInfo" },
      payment_slip: { type: mongoose.Schema.Types.ObjectId, ref: "FileInfo" },
      previous_payment_slips: [{ type: mongoose.Schema.Types.ObjectId, ref: "FileInfo" }],
    })

    this.statics.editAccountInfoDTO = editOtherAccountInfoDTO

    const oldEditMethod: (dto: any) => void = this.methods.editAccountInfo

    this.methods.editAccountInfo = function (this: OtherUser, updt: editOtherAccountInfoDTO) {
      if (this.verification_status == "Submitted" || this.verification_status == "Verified") {
        // can only edit email, phone number, and address
        this.address = updt.address ?? this.address
        this.phone = updt.phone ?? this.phone
        this.home_phone = updt.home_phone ?? this.home_phone
        this.personal_email = updt.personal_email ?? this.personal_email
      } else {
        oldEditMethod.call(this, updt)
        UserSchemaClass.assignNotNull(this, updt, { verification_status: "Submitted", rejected_info: [] })
      }
    }
  }
}

export const OtherSchema = new OtherSchemaClass()
