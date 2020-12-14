import { Type } from "class-transformer"
import { ArrayMinSize, IsDate, IsInt, IsNumber, IsString, Max, Min, ValidateNested } from "class-validator"
import { EditContactPersonDTO } from "src/users/accountInfos/accountInfos.dto"
import { DisableTime } from "./interfaces/disable-courts.interface"

export class CreateDisableCourtDTO {
    @IsString()
    sport_name_en: string
    @IsString()
    sport_name_th: string
    @IsInt()
    @Min(0)
    court_num: number
    @Type(() => Date)
    @IsDate()
    starting_date: Date
    @Type(() => Date)
    @IsDate()
    expired_date: Date
    @ArrayMinSize(1)
    @ValidateNested({ each: true })
    @Type(() => CreateDisableTimeDTO)
    disable_time: Array<CreateDisableTimeDTO>
}

export class CreateDisableTimeDTO {
    @IsInt()
    @Min(0)
    start_time: number
    @IsInt()
    @Min(0)
    end_time: number
    @IsInt()
    @Min(0)
    @Max(6)
    day: number
}