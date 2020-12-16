import { Expose, Type } from 'class-transformer';
import { IsBoolean, IsDate, IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Account } from '../interfaces/user.interface';

export class editAccountInfoDto {
    @IsEnum(Account)
    account_type: Account
    @IsNotEmpty()
    data : any
}

export class editCuAccountInfoDTO {
    @Expose()
    @IsString()
    @IsOptional()
    phone: string
    @Expose()
    @IsEmail()
    @IsOptional()
    personal_email: string
    @Expose()
    @IsBoolean()
    @IsOptional()
    is_thai_language: boolean
}

export class postCuAccountInfoDTO {
    @Expose()
    @IsString()
    phone: string
    @Expose()
    @IsEmail()
    personal_email: string
    @Expose()
    @IsBoolean()
    is_thai_language: boolean
}


export class editSatitCuPersonelAccountInfoDTO{
    @Expose()
    @IsString()
    @IsOptional()
    phone: string
    @Expose()
    @IsEmail()
    @IsOptional()
    personal_email: string
    @Expose()
    @IsBoolean()
    @IsOptional()
    is_thai_language: boolean
}

export class PostContactPersonDTO {
    @Expose()
    @IsString()
    contact_person_prefix: string
    @Expose()
    @IsString()
    contact_person_name: string
    @Expose()
    @IsString()
    contact_person_surname: string
    @Expose()
    @IsString()
    @IsOptional()
    contact_person_home_phone: string
    @Expose()
    @IsString()
    @IsOptional()
    contact_person_phone: string
}

export class EditContactPersonDTO {
    @Expose()
    @IsString()
    @IsOptional()
    contact_person_prefix: string
    @Expose()
    @IsString()
    @IsOptional()
    contact_person_name: string
    @Expose()
    @IsString()
    @IsOptional()
    contact_person_surname: string
    @Expose()
    @IsString()
    @IsOptional()
    contact_person_home_phone: string
    @Expose()
    @IsString()
    @IsOptional()
    contact_person_phone: string
}

export class editOtherAccountInfoDTO {
    @Expose()
    @IsBoolean()
    @IsOptional()
    is_thai_language: boolean
    @Expose()
    @IsString()
    @IsOptional()
    prefix: string
    @Expose()
    @IsString()
    @IsOptional()
    name_th: string
    @Expose()
    @IsString()
    @IsOptional()
    surname_th: string
    @Expose()
    @IsString()
    @IsOptional()
    name_en: string
    @Expose()
    @IsString()
    @IsOptional()
    surname_en: string
    @Expose()
    @Type(()=>Date)
    @IsDate()
    @IsOptional()
    birthday: Date
    @Expose()
    @IsString()
    @IsOptional()
    national_id: string
    @Expose()
    @IsString()
    @IsOptional()
    gender: string
    @Expose()
    @IsString()
    @IsOptional()
    marital_status: string
    @Expose()
    @IsString()
    @IsOptional()
    address: string
    @Expose()
    @IsString()
    @IsOptional()
    phone: string
    @Expose()
    @IsString()
    @IsOptional()
    home_phone: string
    @Expose()
    @IsString()
    @IsOptional()
    @IsEmail()
    personal_email: string
    @Expose()
    @IsOptional()
    @Type(()=>EditContactPersonDTO)
    @ValidateNested()
    contact_person: EditContactPersonDTO;
    @Expose()
    @IsString()
    @IsOptional()
    medical_condition: string
}

export class PostOtherAccountInfoDTO {
    @Expose()
    @IsBoolean()
    is_thai_language: boolean
    @Expose()
    @IsString()
    prefix: string
    @Expose()
    @IsString()
    name_th: string
    @Expose()
    @IsString()
    surname_th: string
    @Expose()
    @IsString()
    name_en: string
    @Expose()
    @IsString()
    surname_en: string
    @Expose()
    @Type(()=>Date)
    @IsDate()
    birthday: Date
    @Expose()
    @IsString()
    national_id: string
    @Expose()
    @IsString()
    gender: string
    @Expose()
    @IsString()
    @IsOptional()
    marital_status: string
    @Expose()
    @IsString()
    @IsOptional()
    address: string
    @Expose()
    @IsString()
    @IsOptional()
    phone: string
    @Expose()
    @IsString()
    @IsOptional()
    home_phone: string
    @Expose()
    @IsString()
    @IsOptional()
    @IsEmail()
    personal_email: string
    @Expose()
    @Type(()=>PostContactPersonDTO)
    @ValidateNested()
    contact_person: PostContactPersonDTO;
    @Expose()
    @IsString()
    @IsOptional()
    medical_condition: string
}
