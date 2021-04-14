import * as mongoose from "mongoose"
import { FileInfo } from "src/fs/fileInfo.schema"
import { editOtherAccountInfoDTO, EditUserInfoDTO } from "../accountInfos/accountInfos.dto"

export enum Account {
  CuStudent = "CuStudent",
  SatitAndCuPersonel = "SatitAndCuPersonel",
  Other = "Other",
}

export type Verification = "NotSubmitted" | "Submitted" | "Verified" | "Rejected"

// NotSubmitted -> Submitted -> Rejected -> Submitted -> NotSubmitted
export type DocumentStatus = "Submitted" | "Rejected" | "NotSubmitted"

export interface Contact_person {
  contact_person_prefix: string
  contact_person_name: string
  contact_person_surname: string
  contact_person_home_phone: string
  contact_person_phone: string
}

export interface User extends mongoose.Document {
  account_type: Account
  is_thai_language: boolean
  name_th: string
  surname_th: string
  name_en: string
  surname_en: string
  username: string
  personal_email: string
  phone: string
  is_penalize: boolean
  expired_penalize_date: Date
  uploadableFileTypes: () => Array<string>
  updateFileInfo: (FileInfo) => mongoose.Types.ObjectId
  validateAndEditAccountInfo?: (updt: EditUserInfoDTO, all: boolean) => Promise<User>
  editAccountInfo?: (updt: EditUserInfoDTO) => User
  setPassword?: (hashedPassword: string) => void
  getPassword?: () => string
  updateBan?: () => void
}

export interface CuStudentUser extends User {
  /* ---- Inherited from User ----
    account_type: Account
    is_thai_language: boolean
    name_th: string
    surname_th: string
    name_en: string
    surname_en: string
    username: string // student id
    personal_email: string
    phone: string
    is_penalize: boolean
    expired_penalize_date: Date 
    ---- Inherited from User ---- */
  is_first_login: boolean
}

export interface SatitCuPersonelUser extends User {
  /* ---- Inherited from User ----
    account_type: Account
    is_thai_language: boolean
    name_th: string
    surname_th: string
    name_en: string
    surname_en: string
    username: string
    personal_email: string
    phone: string
    is_penalize: boolean
    expired_penalize_date: Date 
    ---- Inherited from User ---- */
  password: string
  verification_status: Verification
  rejected_info: string[]
  account_expiration_date: Date
  document_status: DocumentStatus
  student_card_photo: mongoose.Types.ObjectId
  previous_student_card_photo: mongoose.Types.ObjectId[]
}

export interface OtherUser extends User {
  /* ---- Inherited from User ----
    account_type: Account
    is_thai_language: boolean
    name_th: string
    surname_th: string
    name_en: string
    surname_en: string
    username: string // email (cannot change)
    personal_email: string
    phone: string
    is_penalize: boolean
    expired_penalize_date: Date 
    ---- Inherited from User ---- */
  prefix: string //(เพื่อแสดง นาย/นาง/นางสาว)
  birthday: Date //(use this for cal age)
  national_id: string //(also pasport no in foreign)
  gender: string
  marital_status: string
  address: string
  home_phone: string
  contact_person: Contact_person
  medical_condition: string
  membership_type: string
  password: string //pass=phone(editable)
  verification_status: Verification
  rejected_info: string[]
  account_expiration_date: Date
  user_photo: mongoose.Types.ObjectId //(ของcollectionที่เก็บรูป)
  medical_certificate: mongoose.Types.ObjectId
  national_id_house_registration: mongoose.Types.ObjectId //also passport photo
  relationship_verification_document: mongoose.Types.ObjectId
  payment_slip: mongoose.Types.ObjectId // current payment slip
  previous_payment_slips: mongoose.Types.ObjectId[] // previous payment slip, up to MAX_PREV_SLIPS
  document_status: DocumentStatus
  validateAndEditAccountInfo?: (updt: editOtherAccountInfoDTO, all: boolean) => Promise<User>
}

export const MAX_PREV_SLIPS = 2
