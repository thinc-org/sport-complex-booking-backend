import { IsString } from "class-validator"
import { IsNumber } from "class-validator"
import { ApiProperty } from "@nestjs/swagger"
import * as mongoose from "mongoose"
export class CreateStaffDto extends mongoose.Document {
  @ApiProperty()
  readonly name: string
  @ApiProperty()
  readonly surname: string
  @ApiProperty()
  readonly username: string
  @ApiProperty()
  password: string
  @ApiProperty()
  readonly is_admin: boolean
}

export class StaffBodyDTO {
  @ApiProperty()
  new_staff: CreateStaffDto
}

export class SearchQueryDTO {
  @ApiProperty()
  @IsNumber()
  start: number
  @ApiProperty()
  @IsNumber()
  end: number
  @ApiProperty()
  @IsString()
  filter: string
  @ApiProperty()
  @IsNumber()
  type: string
}

export class SearchResultDTO {
  @ApiProperty()
  @IsNumber()
  allStaff_length: number
  @ApiProperty()
  staff_list: CreateStaffDto[]
}
