import { ApiProperty } from "@nestjs/swagger"
import { IsArray, IsDate, IsEmail, IsNumber, ValidateNested, IsString } from "class-validator"
import { Type } from "class-transformer"
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
export class listUserDTO {
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
export class searchResultDTO {
    @ApiProperty()
    @IsNumber()
    doc_count: Number

    @ApiProperty({ type: listUserDTO })
    @ValidateNested()
    @Type(() => listUserDTO)
    doc_list: listUserDTO[]

}