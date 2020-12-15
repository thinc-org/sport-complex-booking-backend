import * as mongoose from 'mongoose';

export enum Account {
    CuStudent = 'CuStudent',
    SatitAndCuPersonel = 'SatitAndCuPersonel',
    Other = 'Other'
}

export enum Verification {
    NotSubmitted = 'NotSubmitted',
    Submitted = 'Submitted',
    Verified = 'Verified',
    Rejected = 'Rejected'
}

export interface Contact_person {
    contact_person_prefix: string
    contact_person_name: string
    contact_person_surname: string
    contact_person_home_phone: string
    contact_person_phone: string
}

export class CreateSatitUserDto extends mongoose.Document {
    account_type: Account.SatitAndCuPersonel
    is_thai_language: boolean
    name_th: string
    surname_th: string
    name_en: string
    surname_en: string
    username: string
    password: string
    personal_email: string
    phone: string
    is_penalize: boolean
    expired_penalize_date: Date
}

export class CreateOtherUserDto extends mongoose.Document {
    account_type: Account.Other
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
    prefix: string //(เพื่อแสดง นาย/นาง/นางสาว)
    birthday: Date //(use this for cal age)
    national_id: string //(also pasport no in foreign) 
    gender: string
    marital_status: string
    address: string
    home_phone: string
    contact_person: {
        contact_person_prefix: string
        contact_person_name: string
        contact_person_surname: string
        contact_person_home_phone: string
        contact_person_phone: string
    }
    medical_condition: string
    membership_type: string
    password: string //pass=phone(editable)
    verification_status: Verification
    rejected_info: [string]
    account_expiration_date: Date
    user_photo: mongoose.Types.ObjectId //(ของcollectionที่เก็บรูป)
    medical_certificate: mongoose.Types.ObjectId
    national_id_photo: mongoose.Types.ObjectId //also passport photo
    house_registration_number: mongoose.Types.ObjectId//with reference person
    relationship_verification_document: mongoose.Types.ObjectId
}