import { Account } from "./../../staffs/dto/add-user.dto"
import { ApiProperty, ApiPropertyOptional, ApiResponse } from "@nestjs/swagger"
import { Exclude, Type } from "class-transformer"
import { IsBoolean, IsDate, IsEmail, IsNotEmpty, IsOptional, IsString, ValidateNested } from "class-validator"
import { User } from "../interfaces/user.interface"

export class UserDTO {
  @Exclude()
  password: string
  _id: string
  constructor(user: Partial<User>) {
    const userJSON = user.toJSON({ getters: true, virtuals: true })
    Object.assign(this, JSON.parse(JSON.stringify(userJSON)))
  }
}

export class CreateContactPersonDTO {
  @ApiProperty()
  @IsString()
  contact_person_prefix: string

  @ApiProperty()
  @IsString()
  contact_person_name: string

  @ApiProperty()
  @IsString()
  contact_person_surname: string

  @ApiProperty()
  @IsString()
  contact_person_home_phone: string

  @ApiProperty()
  @IsString()
  contact_person_phone: string
}

export class CreateOtherUserDTO {
  @ApiProperty()
  @IsEmail()
  username: string // email (cannot change)

  @ApiProperty()
  @IsString()
  membership_type: string

  @ApiProperty()
  @IsString()
  password: string //pass=phone(editable)

  @ApiProperty()
  @IsBoolean()
  is_thai_language: boolean

  @ApiProperty()
  @IsString()
  prefix: string

  @ApiProperty()
  @IsString()
  name_th: string

  @ApiProperty()
  @IsString()
  surname_th: string

  @ApiProperty()
  @IsString()
  name_en: string

  @ApiProperty()
  @IsString()
  surname_en: string

  @ApiProperty()
  @Type(() => Date)
  @IsDate()
  birthday: Date

  @ApiProperty()
  @IsString()
  national_id: string

  @ApiProperty()
  @IsString()
  gender: string

  @ApiProperty()
  @IsString()
  marital_status: string

  @ApiProperty()
  @IsString()
  address: string

  @ApiProperty()
  @IsString()
  phone: string

  @ApiProperty()
  @IsString()
  home_phone: string

  @ApiProperty()
  @IsString()
  @IsEmail()
  personal_email: string

  @ApiProperty({
    type: CreateContactPersonDTO,
  })
  @IsNotEmpty()
  @Type(() => CreateContactPersonDTO)
  @ValidateNested()
  contact_person: CreateContactPersonDTO

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  medical_condition?: string
}

export class CreateUserResponseDTO {
  @ApiProperty()
  jwt: string
  @ApiProperty({
    type: CreateOtherUserDTO,
    description: "Created User",
  })
  user: UserDTO
  constructor(user: Partial<User>, jwt: string) {
    this.jwt = jwt
    this.user = new UserDTO(user)
  }
}

export class AppticketDTO {
  @ApiProperty()
  @IsString()
  appticket: string
}

export class SSOValidationResult {
  @ApiProperty()
  @IsString()
  token: string
  @ApiProperty()
  @IsBoolean()
  is_first_login: boolean
  @ApiProperty()
  @IsBoolean()
  is_thai_language: boolean
}

export class SSOValidationUpdateInfoDTO {
  @ApiProperty()
  @IsString()
  is_thai_language: boolean
  @ApiProperty()
  @IsString()
  personal_email: string
  @ApiProperty()
  @IsString()
  phone: string
}

export class CUStudentDTO {
  @ApiProperty()
  @Type(() => String)
  account_type: Account
  @ApiProperty()
  @IsBoolean()
  is_thai_language: boolean
  @ApiProperty()
  @IsString()
  name_th: string
  @ApiProperty()
  @IsString()
  surname_th: string
  @ApiProperty()
  @IsString()
  name_en: string
  @ApiProperty()
  @IsString()
  surname_en: string
  @ApiProperty()
  @IsString()
  username: string
  @ApiProperty()
  @IsString()
  personal_email: string
  @ApiProperty()
  @IsString()
  phone: string
  @ApiProperty()
  @IsBoolean()
  is_penalize: boolean
  @ApiProperty()
  @IsDate()
  expired_penalize_date: Date
  @ApiProperty()
  @IsBoolean()
  is_first_login: boolean
}
