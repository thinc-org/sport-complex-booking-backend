import { HttpException, HttpStatus } from "@nestjs/common"
import { plainToClass } from "class-transformer"
import { validateOrReject } from "class-validator"
import * as mongoose from "mongoose"
import { editOtherAccountInfoDTO, EditUserInfoDTO } from "../accountInfos/accountInfos.dto"
import { Verification } from "../interfaces/user.interface"

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

    this.methods.editAccountInfo = function(updt: EditUserInfoDTO) {
      this.is_thai_language = updt.is_thai_language ?? this.is_thai_language
      this.personal_email = updt.personal_email ?? this.personal_email
      this.phone = updt.phone ?? this.phone
    }

    this.methods.validateAndEditAccountInfo = async function(updt, all: boolean) {
      const Model = this.constructor
      const info = plainToClass(Model.editAccountInfoDTO, updt, { excludeExtraneousValues: true })
      try {
        await validateOrReject(info, { groups: [all ? "all" : "optional"], validationError: { target: false } })
        this.editAccountInfo(info)
      } catch (err) {
        throw new HttpException(err, HttpStatus.BAD_REQUEST)
      }
    }

    this.methods.setPassword = function(hashedPassword: string) {
      this.password = hashedPassword
    }

    this.methods.getPassword = function() {
      if (this.password) return this.password
      else throw new HttpException("password does not exist", HttpStatus.INTERNAL_SERVER_ERROR)
    }

    this.methods.updateBan = function() {
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
}

export const UserSchema = new UserSchemaClass()
UserSchema.index({ personal_email: 1 }, { unique: true })

class CuStudentSchemaClass extends UserSchemaClass {
  constructor() {
    super({ is_first_login: Boolean })
    this.methods.setPassword = function() {
      throw new HttpException("Custudent cannot change password", HttpStatus.FORBIDDEN)
    }
    this.methods.getPassword = function() {
      throw new HttpException("Custudent does not have password", HttpStatus.FORBIDDEN)
    }

    const oldEditMethod: (dto: any) => void = this.methods.editAccountInfo

    this.methods.editAccountInfo = function(updt: EditUserInfoDTO) {
      oldEditMethod.call(this, updt)
      this.is_first_login = false
    }
  }
}

export const CuStudentSchema = new CuStudentSchemaClass()

class SatitCuPersonelSchemaClass extends UserSchemaClass {
  constructor() {
    super({ password: String })
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
      user_photo: mongoose.Schema.Types.ObjectId, //(ของcollectionที่เก็บรูป)
      medical_certificate: mongoose.Schema.Types.ObjectId,
      national_id_photo: mongoose.Schema.Types.ObjectId, //also passport photo
      house_registration_number: mongoose.Schema.Types.ObjectId, //with reference person
      relationship_verification_document: mongoose.Schema.Types.ObjectId,
    })

    this.statics.editAccountInfoDTO = editOtherAccountInfoDTO

    const oldEditMethod: (dto: any) => void = this.methods.editAccountInfo

    this.methods.editAccountInfo = function(updt: editOtherAccountInfoDTO) {
      if (this.verification_status == Verification.Submitted || this.verification_status == Verification.Verified) {
        throw new HttpException("Please contact admin to modify account data", HttpStatus.FORBIDDEN)
      }
      oldEditMethod.call(this, updt)
      OtherSchemaClass.assignNotNull(this, updt, { verification_status: Verification.Submitted, rejected_info: [] })
    }
  }

  private static assignNotNull(target, ...sources) {
    for (const source of sources) {
      for (const key of Object.keys(source)) {
        const val = source[key]
        if (val != null) {
          if (target[key] === undefined || val instanceof Array || !(val instanceof Object)) target[key] = val
          else OtherSchemaClass.assignNotNull(target[key], val)
        }
      }
    }
    return target
  }
}

export const OtherSchema = new OtherSchemaClass()
