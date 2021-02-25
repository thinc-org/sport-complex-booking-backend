import { ApiProperty } from "@nestjs/swagger"
import { IsBoolean, IsEmail, IsString } from "class-validator"

export enum Account {
  CuStudent = "CuStudent",
  SatitAndCuPersonel = "SatitAndCuPersonel",
  Other = "Other",
}

export enum Verification {
  NotSubmitted = "NotSubmitted",
  Submitted = "Submitted",
  Verified = "Verified",
  Rejected = "Rejected",
}

export interface Contact_person {
  contact_person_prefix: string
  contact_person_name: string
  contact_person_surname: string
  contact_person_home_phone: string
  contact_person_phone: string
}

export class CreateSatitUserDto {
  @ApiProperty()
  account_type: Account.SatitAndCuPersonel
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
  @IsEmail()
  username: string
  @ApiProperty()
  @IsString()
  password: string
  @ApiProperty()
  @IsString()
  personal_email: string
  @ApiProperty()
  @IsString()
  phone: string
}

export class CreateOtherUserDto {
  account_type: Account.Other
  @IsEmail()
  username: string // email (cannot change)
  membership_type: string
  password: string //pass=phone(editable)
}
