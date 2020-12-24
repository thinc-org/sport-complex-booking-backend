import { Type } from "class-transformer"
import { ArrayMinSize, IsBoolean, IsDate, IsInt, IsNumber, IsOptional, IsString, Max, Min, ValidateNested } from "class-validator"
import { Types } from "mongoose"
import { DisableCourt } from "./interfaces/disable-courts.interface"

export class CreateDisableCourtDTO {
    @IsString()
    description: string

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
    @ArrayMinSize(1)
    @IsNumber({}, {each: true})
    @Min(1, {each: true})
    @Max(48, {each: true})
    time_slot: Array<number>

    @IsInt()
    @Min(0)
    @Max(6)
    day: number
}

export class EditDisableCourtDTO {
    @IsOptional()
    @IsString()
    description?: string

    @IsOptional()
    @IsString()
    sport_id?: Types.ObjectId

    @IsOptional()
    @IsInt()
    @Min(0)
    court_num?: number

    @IsOptional()
    @Type(() => Date)
    @IsDate()
    starting_date?: Date

    @IsOptional()
    @Type(() => Date)
    @IsDate()
    expired_date?: Date
    
    @IsOptional()
    @ArrayMinSize(1)
    @ValidateNested({ each: true })
    @Type(() => CreateDisableTimeDTO)
    disable_time?: Array<CreateDisableTimeDTO>
}


export class QueryResult {
    total_found: number
    total_returned: number
    sliced_results: Array<DisableCourt>
}

export class QueryDisableCourtDTO {
    @IsOptional()
    @Type(()=>Date)
    @IsDate()
    starting_date?: Date

    @IsOptional()
    @Type(()=>Date)
    @IsDate()
    expired_date?: Date

    @IsOptional()
    @IsString()
    sport_id?: string

    @IsOptional()
    @IsInt()
    @Min(0)
    court_num?: number

    @IsOptional()
    @IsInt()
    start?: number

    @IsOptional()
    @IsInt()
    end?: number

    @IsOptional()
    @IsBoolean()
    lean?: boolean = true
    
    @IsOptional()
    @IsString()
    description?: string
}