import { ApiProperty } from "@nestjs/swagger"
import { Expose, Type } from "class-transformer"
import { IsBoolean, IsDate, IsEmail, IsNotEmpty, IsOptional, IsString, ValidateNested } from "class-validator"

export class EditContactPersonDTO {
  @ApiProperty()
  @Expose()
  @IsString({ always: true })
  @IsOptional({ groups: ["optional"] })
  contact_person_prefix?: string

  @ApiProperty()
  @Expose()
  @IsString({ always: true })
  @IsOptional({ groups: ["optional"] })
  contact_person_name?: string

  @ApiProperty()
  @Expose()
  @IsString({ always: true })
  @IsOptional({ groups: ["optional"] })
  contact_person_surname?: string

  @ApiProperty()
  @Expose()
  @IsString({ always: true })
  @IsOptional({ groups: ["optional"] })
  contact_person_home_phone?: string

  @ApiProperty()
  @Expose()
  @IsString({ always: true })
  @IsOptional({ groups: ["optional"] })
  contact_person_phone?: string
}

export class editOtherAccountInfoDTO {
  @ApiProperty()
  @Expose()
  @IsBoolean({ always: true })
  @IsOptional({ groups: ["optional"] })
  is_thai_language?: boolean

  @ApiProperty()
  @Expose()
  @IsString({ always: true })
  @IsOptional({ groups: ["optional"] })
  prefix?: string

  @ApiProperty()
  @Expose()
  @IsString({ always: true })
  @IsOptional({ groups: ["optional"] })
  name_th?: string

  @ApiProperty()
  @Expose()
  @IsString({ always: true })
  @IsOptional({ groups: ["optional"] })
  surname_th?: string

  @ApiProperty()
  @Expose()
  @IsString({ always: true })
  @IsOptional({ groups: ["optional"] })
  name_en?: string

  @ApiProperty()
  @Expose()
  @IsString({ always: true })
  @IsOptional({ groups: ["optional"] })
  surname_en?: string

  @ApiProperty()
  @Expose()
  @Type(() => Date)
  @IsDate({ always: true })
  @IsOptional({ groups: ["optional"] })
  birthday?: Date

  @ApiProperty()
  @Expose()
  @IsString({ always: true })
  @IsOptional({ groups: ["optional"] })
  national_id?: string

  @ApiProperty()
  @Expose()
  @IsString({ always: true })
  @IsOptional({ groups: ["optional"] })
  gender?: string

  @ApiProperty()
  @Expose()
  @IsString({ always: true })
  @IsOptional({ groups: ["optional"] })
  marital_status?: string

  @ApiProperty()
  @Expose()
  @IsString({ always: true })
  @IsOptional({ groups: ["optional"] })
  address?: string

  @ApiProperty()
  @Expose()
  @IsString({ always: true })
  @IsOptional({ groups: ["optional"] })
  phone?: string

  @ApiProperty()
  @Expose()
  @IsString({ always: true })
  @IsOptional({ groups: ["optional"] })
  home_phone?: string

  @ApiProperty()
  @Expose()
  @IsString({ always: true })
  @IsOptional({ groups: ["optional"] })
  @IsEmail({}, { always: true })
  personal_email?: string

  @ApiProperty()
  @Expose()
  @IsOptional({ groups: ["optional"] })
  @IsNotEmpty({ groups: ["all"] })
  @Type(() => EditContactPersonDTO)
  @ValidateNested({ always: true })
  contact_person?: EditContactPersonDTO

  @ApiProperty()
  @Expose()
  @IsString({ always: true })
  @IsOptional({ groups: ["optional"] })
  medical_condition: string
}

export class ChangePasswordDTO {
  @ApiProperty()
  @IsString({ always: true })
  oldPassword: string
  @ApiProperty()
  @IsString({ always: true })
  newPassword: string
}

export class EditUserInfoDTO {
  @ApiProperty()
  @Expose()
  @IsString({ always: true })
  @IsOptional({ groups: ["optional"] })
  phone?: string

  @ApiProperty()
  @Expose()
  @IsEmail({}, { always: true })
  @IsOptional({ groups: ["optional"] })
  personal_email?: string

  @ApiProperty()
  @Expose()
  @IsBoolean({ always: true })
  @IsOptional({ groups: ["optional"] })
  is_thai_language?: boolean
}
