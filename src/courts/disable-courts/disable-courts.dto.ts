import { Type } from "class-transformer"
import { ArrayMinSize, IsDate, IsInt, IsNumber, IsOptional, IsString, Max, Min, ValidateNested } from "class-validator"
import { Types } from "mongoose"

export class CreateDisableCourtDTO {
    @IsString()
    sport_id: Types.ObjectId
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

export class EditDisableCourtDTO {
    @IsOptional()
    @IsString()
    sport_id: Types.ObjectId
    @IsOptional()
    @IsInt()
    @Min(0)
    court_num: number
    @IsOptional()
    @Type(() => Date)
    @IsDate()
    starting_date: Date
    @IsOptional()
    @Type(() => Date)
    @IsDate()
    expired_date: Date
    @IsOptional()
    @ArrayMinSize(1)
    @ValidateNested({ each: true })
    @Type(() => CreateDisableTimeDTO)
    disable_time: Array<CreateDisableTimeDTO>
}

export class AddDisableTimeDTO {
    @ArrayMinSize(1)
    @ValidateNested({ each: true })
    @Type(() => CreateDisableTimeDTO)
    disable_times: Array<CreateDisableTimeDTO>
}