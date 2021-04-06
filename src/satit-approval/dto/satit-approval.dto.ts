import { ApiProperty } from "@nestjs/swagger"
import { IsArray, IsDate, IsEmail, IsNumber, ValidateNested, IsString, IsBoolean } from "class-validator"
import { Type } from "class-transformer"

export class SatitUserDTO {
    @ApiProperty()
    username: string

    @ApiProperty()
    @IsString()
    password: string

    @ApiProperty()
    @IsBoolean()
    is_thai_language: boolean

    @ApiProperty()
    @IsDate()
    account_expiration_date: Date

    @ApiProperty()
    @IsString()
    name_th: string

    @ApiProperty()
    @IsString()
    surname_th: string

    @ApiProperty()
    @IsString()
    name_en: string

    @ApiProperty()
    @IsString()
    surname_en: string

    @ApiProperty()
    @IsString()
    phone: string

    @ApiProperty()
    @IsString()
    verification_status: string

    @ApiProperty()
    @IsString()
    student_card_photo_status: string

    @ApiProperty()
    @IsArray()
    rejected_info: string[]

    @ApiProperty()
    @IsString()
    @IsEmail()
    personal_email: string

}

export class SetStatusDTO {
    @ApiProperty()
    @IsString()
    id: String
}

export class ApproveDTO extends SetStatusDTO {
    @ApiProperty()
    @IsDate()
    newExpiredDate: Date
}
export class RejectDTO extends SetStatusDTO {
    @ApiProperty()
    @IsArray()
    rejectInfo: String[]
}
export class ListUserDTO {
    @ApiProperty()
    @IsEmail()
    username: string // email (cannot change)

    @ApiProperty()
    @IsString()
    name_th: string

    @ApiProperty()
    @IsString()
    surname_th: string

    @ApiProperty()
    @IsString()
    name_en: string

    @ApiProperty()
    @IsString()
    surname_en: string
}
export class SearchResultDTO {
    @ApiProperty()
    @IsNumber()
    doc_count: Number

    @ApiProperty({ type: ListUserDTO })
    @ValidateNested()
    @Type(() => ListUserDTO)
    doc_list: ListUserDTO[]
}