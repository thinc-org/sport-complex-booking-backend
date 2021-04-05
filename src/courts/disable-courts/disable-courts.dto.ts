import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger"
import { Type } from "class-transformer"
import { ArrayMinSize, IsBoolean, IsDate, IsInt, IsNumber, IsOptional, IsString, Max, Min, ValidateNested } from "class-validator"
import { Types } from "mongoose"
import { DisableCourt } from "./interfaces/disable-courts.interface"

export class CreateDisableTimeDTO {
  @ApiProperty({
    type: [Number],
    minimum: 1,
    maximum: 24,
  })
  @ArrayMinSize(1)
  @IsNumber({}, { each: true })
  @Min(1, { each: true })
  @Max(24, { each: true })
  time_slot: Array<number>

  @ApiProperty({
    description: "day of week ( 0 is sunday )",
    minimum: 0,
    maximum: 6,
  })
  @IsInt()
  @Min(0)
  @Max(6)
  day: number
}

export class CreateDisableCourtDTO {
  @ApiProperty()
  @IsString()
  description: string

  @ApiProperty({
    type: String,
  })
  @IsString()
  sport_id: Types.ObjectId

  @ApiProperty()
  @IsInt()
  @Min(0)
  court_num: number

  @ApiProperty()
  @Type(() => Date)
  @IsDate()
  starting_date: Date

  @ApiProperty()
  @Type(() => Date)
  @IsDate()
  expired_date: Date

  @ApiProperty({
    type: [CreateDisableTimeDTO],
  })
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateDisableTimeDTO)
  disable_time: Array<CreateDisableTimeDTO>
}

export class EditDisableCourtDTO {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string

  @ApiPropertyOptional({
    type: String,
  })
  @IsOptional()
  @IsString()
  sport_id?: Types.ObjectId

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(0)
  court_num?: number

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  starting_date?: Date

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  expired_date?: Date

  @ApiPropertyOptional({
    type: [CreateDisableTimeDTO],
  })
  @IsOptional()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateDisableTimeDTO)
  disable_time?: Array<CreateDisableTimeDTO>
}

export class DisableCourtDTO extends CreateDisableCourtDTO {}

export class QueryResult {
  @ApiProperty({
    description: "Total disable courts found",
  })
  total_found: number
  @ApiProperty({
    description: "Total disable courts returned according to start and end value in the request",
  })
  total_returned: number
  @ApiProperty({
    type: [DisableCourtDTO],
  })
  sliced_results: Array<DisableCourt>
}

export class QueryDisableCourtDTO {
  @ApiProperty()
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  starting_date?: Date

  @ApiProperty()
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  expired_date?: Date

  @ApiProperty()
  @IsOptional()
  @IsString()
  sport_id?: string

  @ApiProperty()
  @IsOptional()
  @IsInt()
  @Min(0)
  court_num?: number

  @ApiProperty({
    description: "Return sliced result in range [start,end]",
  })
  @IsOptional()
  @IsInt()
  start?: number

  @ApiProperty({
    description: "Return sliced result in range [start,end]",
  })
  @IsOptional()
  @IsInt()
  end?: number

  @ApiProperty({
    description: "Returned disable courts will not have disable time array if lean is true",
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  lean?: boolean = true

  @ApiProperty()
  @IsOptional()
  @IsString()
  description?: string
}
