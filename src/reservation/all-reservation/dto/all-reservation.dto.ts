import { ApiProperty } from "@nestjs/swagger"
import { IsArray, IsDate, IsEmail, IsNumber, ValidateNested, IsString, IsBoolean } from "class-validator"
import { Type } from "class-transformer"
class RoomDTO {
    @ApiProperty()
    @IsString()
    sport_id: String

    @ApiProperty()
    @IsNumber()
    court_number: Number

    @ApiProperty({ minimum: 1, maximum: 7 })
    @IsNumber()
    day_of_week: Number

    @ApiProperty()
    @IsDate()
    date: Date

    @ApiProperty({ type: [Number] })
    time_slot: Number[]

}
export class SearchDTO extends RoomDTO {


    @ApiProperty({ minimum: 0, default: 0 })
    @IsNumber()
    start: Number

    @ApiProperty()
    @IsNumber()
    end: Number
}
export class ReservationDTO extends RoomDTO {
    @ApiProperty()
    @IsArray()
    list_member: String[]

    @ApiProperty()
    @IsBoolean()
    is_check: Boolean
}
export class WaitingRoomDTO extends RoomDTO {
    @ApiProperty()
    @IsArray()
    list_member: String[]

    @ApiProperty()
    @IsString()
    access_code: String

    @ApiProperty()
    @IsDate()
    expired_date: Date
}
export class SearchReservationResultDTO {
    @ApiProperty()
    @IsNumber()
    doc_count: Number

    @ApiProperty({ type: ReservationDTO })
    @ValidateNested()
    @Type(() => ReservationDTO)
    doc_list: ReservationDTO[]
}
export class SearchWaitingRoomResultDTO {
    @ApiProperty()
    @IsNumber()
    doc_count: Number

    @ApiProperty({ type: WaitingRoomDTO })
    @ValidateNested()
    @Type(() => WaitingRoomDTO)
    doc_list: WaitingRoomDTO[]
}