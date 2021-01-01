import { Contact_person , Verification } from "./../../../users/interfaces/user.interface";
import { Types } from "mongoose";

export interface EditingDto { 
    forExistProperty?: boolean
    is_thai_language?: boolean
    name_th?: string
    surname_th?: string
    name_en?: string
    surname_en?: string
    username?: string
    personal_email?: string
    phone?: string
    is_penalize?: boolean
    expired_penalize_date?: Date
    is_first_login?: boolean
    prefix?: string 
    birthday?: Date 
    national_id?: string  
    gender?: string
    marital_status?: string
    address?: string
    home_phone?: string
    contact_person?: Contact_person
    medical_condition?: string
    membership_type?: string
    password?: string 
    verification_status?: Verification
    rejected_info?: string[]
    account_expiration_date?: Date
    user_photo?: Types.ObjectId 
    medical_certificate?: Types.ObjectId
    national_id_photo?: Types.ObjectId 
    house_registration_number?: Types.ObjectId
    relationship_verification_document?: Types.ObjectId
}

export interface ChangingPasswordDto {
    password : string
}