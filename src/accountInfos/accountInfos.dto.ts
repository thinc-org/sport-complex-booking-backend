import { IsBoolean, IsDate, isDefined, IsEmail, IsNotEmpty, IsOptional, isString, IsString, ValidateNested } from 'class-validator';
import { Contact_person } from './accountInfo.schema';
import { Schema as MongooseSchema } from 'mongoose'

export class editAccountInfoDTO {
    @IsString()
    phone: string
    @IsEmail()
    personal_email: string
    @IsBoolean()
    is_thai_language: boolean
}

export class ContactPersonDTO {
    @IsString()
    contact_person_prefix: string
    @IsString()
    contact_person_name: string
    @IsString()
    contact_person_surname: string
    @IsString()
    @IsOptional()
    contact_person_home_phone: string
    @IsString()
    @IsOptional()
    contact_person_phone: string
}

export class editOtherAccountInfoDTO {
    @IsBoolean()
    is_thai_language: boolean
    @IsString()
    prefix: string
    @IsString()
    name: string
    @IsString()
    surname: string
    @IsDate()
    birthday: Date
    @IsString()
    national_id: string
    @IsString()
    gender: string
    @IsString()
    @IsOptional()
    marital_status: string
    @IsString()
    @IsOptional()
    address: string
    @IsString()
    @IsOptional()
    phone: string
    @IsString()
    @IsOptional()
    home_phone: string
    @IsString()
    @IsOptional()
    personal_email: string
    @ValidateNested()
    contact_person: ContactPersonDTO;
    @IsString()
    @IsOptional()
    medical_condition: string
}
