import { Verification } from "./../../../users/interfaces/user.interface"
import { Types } from "mongoose"
import { IsBoolean, IsString, IsEnum, IsMongoId, IsOptional, IsDateString, ValidateNested } from "class-validator"
import { Type } from "class-transformer"
import { ApiPropertyOptional, ApiProperty } from "@nestjs/swagger"
class Contact_person {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  contact_person_prefix?: string
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  contact_person_name?: string
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  contact_person_surname?: string
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  contact_person_home_phone?: string
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  contact_person_phone?: string
}

export class ChangingPasswordDto {
  @ApiProperty()
  @IsString()
  password: string
}

export class UserEditingDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  is_thai_language?: boolean
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  name_th?: string
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  surname_th?: string
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  name_en?: string
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  surname_en?: string
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  username?: string
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  personal_email?: string
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  phone?: string
  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  is_penalize?: boolean
  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  expired_penalize_date?: Date
}

export class CuStudentUserEditingDto extends UserEditingDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  is_first_login?: boolean
}

export class SatitAndCuPersonelEditingDto extends UserEditingDto {}

export class OtherUserEditingDto extends UserEditingDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  prefix?: string
  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  birthday?: Date
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  national_id?: string
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  gender?: string
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  marital_status?: string
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  address?: string
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  home_phone?: string
  @ApiPropertyOptional()
  @IsOptional()
  contact_person?: Contact_person
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  medical_condition?: string
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  membership_type?: string
  @ApiPropertyOptional()
  @IsOptional()
  @IsEnum(["NotSubmitted", "Submitted", "Verified", "Rejected"])
  verification_status?: Verification
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  rejected_info?: string[]
  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  account_expiration_date?: Date
  @ApiPropertyOptional()
  @IsOptional()
  @IsMongoId()
  user_photo?: Types.ObjectId
  @ApiPropertyOptional()
  @IsOptional()
  @IsMongoId()
  medical_certificate?: Types.ObjectId
  @ApiPropertyOptional()
  @IsOptional()
  @IsMongoId()
  national_id_photo?: Types.ObjectId
  @ApiPropertyOptional()
  @IsOptional()
  @IsMongoId()
  house_registration_number?: Types.ObjectId
  @ApiPropertyOptional()
  @IsOptional()
  @IsMongoId()
  relationship_verification_document?: Types.ObjectId
}
