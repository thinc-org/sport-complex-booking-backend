import { IsBoolean, isDefined, IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { Contact_person } from './accountInfo.schema';
import {Schema as MongooseSchema} from 'mongoose'

export class editAccountInfoDTO {
    @IsString()
    phone: string
    @IsEmail()
    personal_email: string
    @IsBoolean()
    is_thai_language: boolean
}

export class editOtherAccountInfoDTO {
    is_thai_language: boolean
    prefix: string
    name: string
    surname: string
    birthday: Date
    national_id: string
    gender: string
    marital_status: string
    address: string
    phone: string
    home_phone: string
    personal_email: string
    contact_person: Contact_person
    medical_condition: string
}
