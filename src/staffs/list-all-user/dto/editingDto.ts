import { Account, Verification } from "./../../../users/interfaces/user.interface";
import { Types } from "mongoose";
import { IsBoolean, IsString, IsEnum, IsDate, IsMongoId, IsOptional, Equals} from "class-validator";
class Contact_person{
    @IsOptional()
    @IsString()
    contact_person_prefix?: string
    @IsOptional()
    @IsString()
    contact_person_name?: string
    @IsOptional()
    @IsString()
    contact_person_surname?: string
    @IsOptional()
    @IsString()
    contact_person_home_phone?: string
    @IsOptional()
    @IsString()
    contact_person_phone?: string
}

export class EditingDto { 
    @IsOptional()
    @IsBoolean()
    is_thai_language?: boolean
    @IsOptional()
    @IsString()
    name_th?: string
    @IsOptional()
    @IsString()
    surname_th?: string
    @IsOptional()
    @IsString()
    name_en?: string
    @IsOptional()
    @IsString()
    surname_en?: string
    @IsOptional()
    @IsString()
    username?: string
    @IsOptional()
    @IsString()
    personal_email?: string
    @IsOptional()
    @IsString()
    phone?: string
    @IsOptional()
    @IsBoolean()
    is_penalize?: boolean
    @IsOptional()
    @IsDate()
    expired_penalize_date?: Date
    @IsOptional()
    @IsBoolean()
    is_first_login?: boolean
    @IsOptional()
    @IsString()
    prefix?: string 
    @IsOptional()
    @IsDate()
    birthday?: Date 
    @IsOptional()
    @IsString()
    national_id?: string  
    @IsOptional()
    @IsString()
    gender?: string
    @IsOptional()
    @IsString()
    marital_status?: string
    @IsOptional()
    @IsString()
    address?: string
    @IsOptional()
    @IsString()
    home_phone?: string
    @IsOptional()
    contact_person?: Contact_person
    @IsOptional()
    @IsString()
    medical_condition?: string
    @IsOptional()
    @IsString()
    membership_type?: string
    @IsOptional()
    @IsEnum(Verification)
    verification_status?: Verification
    @IsOptional()
    @IsString()
    rejected_info?: string[]
    @IsOptional()
    @IsDate()
    account_expiration_date?: Date
    @IsOptional()
    @IsMongoId()
    user_photo?: Types.ObjectId 
    @IsOptional()
    @IsMongoId()
    medical_certificate?: Types.ObjectId
    @IsOptional()
    @IsMongoId()
    national_id_photo?: Types.ObjectId 
    @IsOptional()
    @IsMongoId()
    house_registration_number?: Types.ObjectId
    @IsOptional()
    @IsMongoId()
    relationship_verification_document?: Types.ObjectId
}

export class ChangingPasswordDto {
    @IsString()
    password : string
}