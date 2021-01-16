import { IsEmail } from "class-validator"

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
  account_type: Account.SatitAndCuPersonel
  is_thai_language: boolean
  name_th: string
  surname_th: string
  name_en: string
  surname_en: string
  @IsEmail()
  username: string
  password: string
  personal_email: string
  phone: string
}

export class CreateOtherUserDto {
  account_type: Account.Other
  @IsEmail()
  username: string // email (cannot change)
  membership_type: string
  password: string //pass=phone(editable)
}
