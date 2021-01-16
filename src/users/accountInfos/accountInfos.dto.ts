import { Expose, Type } from "class-transformer"
import { IsBoolean, IsDate, IsEmail, IsNotEmpty, IsOptional, IsString, ValidateNested } from "class-validator"

export class EditContactPersonDTO {
  @Expose()
  @IsString({ always: true })
  @IsOptional({ groups: ["optional"] })
  contact_person_prefix?: string

  @Expose()
  @IsString({ always: true })
  @IsOptional({ groups: ["optional"] })
  contact_person_name?: string

  @Expose()
  @IsString({ always: true })
  @IsOptional({ groups: ["optional"] })
  contact_person_surname?: string

  @Expose()
  @IsString({ always: true })
  @IsOptional({ groups: ["optional"] })
  contact_person_home_phone?: string

  @Expose()
  @IsString({ always: true })
  @IsOptional({ groups: ["optional"] })
  contact_person_phone?: string
}

export class editOtherAccountInfoDTO {
  @Expose()
  @IsBoolean({ always: true })
  @IsOptional({ groups: ["optional"] })
  is_thai_language?: boolean

  @Expose()
  @IsString({ always: true })
  @IsOptional({ groups: ["optional"] })
  prefix?: string

  @Expose()
  @IsString({ always: true })
  @IsOptional({ groups: ["optional"] })
  name_th?: string

  @Expose()
  @IsString({ always: true })
  @IsOptional({ groups: ["optional"] })
  surname_th?: string

  @Expose()
  @IsString({ always: true })
  @IsOptional({ groups: ["optional"] })
  name_en?: string

  @Expose()
  @IsString({ always: true })
  @IsOptional({ groups: ["optional"] })
  surname_en?: string

  @Expose()
  @Type(() => Date)
  @IsDate({ always: true })
  @IsOptional({ groups: ["optional"] })
  birthday?: Date

  @Expose()
  @IsString({ always: true })
  @IsOptional({ groups: ["optional"] })
  national_id?: string

  @Expose()
  @IsString({ always: true })
  @IsOptional({ groups: ["optional"] })
  gender?: string

  @Expose()
  @IsString({ always: true })
  @IsOptional({ groups: ["optional"] })
  marital_status?: string

  @Expose()
  @IsString({ always: true })
  @IsOptional({ groups: ["optional"] })
  address?: string

  @Expose()
  @IsString({ always: true })
  @IsOptional({ groups: ["optional"] })
  phone?: string

  @Expose()
  @IsString({ always: true })
  @IsOptional({ groups: ["optional"] })
  home_phone?: string

  @Expose()
  @IsString({ always: true })
  @IsOptional({ groups: ["optional"] })
  @IsEmail({}, { always: true })
  personal_email?: string

  @Expose()
  @IsOptional({ groups: ["optional"] })
  @IsNotEmpty({ groups: ["all"] })
  @Type(() => EditContactPersonDTO)
  @ValidateNested({ always: true })
  contact_person?: EditContactPersonDTO

  @Expose()
  @IsString({ always: true })
  @IsOptional({ groups: ["optional"] })
  medical_condition: string
}

export class ChangePasswordDTO {
  @IsString({ always: true })
  oldPassword: string
  @IsString({ always: true })
  newPassword: string
}

export class EditUserInfoDTO {
  @Expose()
  @IsString({ always: true })
  @IsOptional({ groups: ["optional"] })
  phone?: string

  @Expose()
  @IsEmail({}, { always: true })
  @IsOptional({ groups: ["optional"] })
  personal_email?: string

  @Expose()
  @IsBoolean({ always: true })
  @IsOptional({ groups: ["optional"] })
  is_thai_language?: boolean
}
