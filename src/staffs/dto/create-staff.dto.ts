import { IsBoolean, IsString } from "class-validator"
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

export class StaffDTO extends CreateStaffDto {
  @ApiProperty()
  password: string
}

export class StaffBodyDTO {
  @ApiProperty()
  new_staff: CreateStaffDto
}

export class PromoteStaffDTO {
  @ApiProperty()
  @IsBoolean()
  is_admin: boolean
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
  @ApiProperty({ type: [CreateStaffDto] })
  staff_list: Array<CreateStaffDto>
}

export class StaffProfileDTO {
  @ApiProperty()
  @IsString()
  name: string
  @ApiProperty()
  @IsString()
  surname: string
  @ApiProperty()
  @IsString()
  username: string
  @ApiProperty()
  @IsString()
  password: string
  @ApiProperty()
  @IsBoolean()
  is_admin: boolean
}

export class StaffLoginSuccessDTO {
  @ApiProperty()
  @IsString()
  jwt: string
}

export class StaffLoginDTO {
  @ApiProperty()
  @IsString()
  username: string
  @ApiProperty()
  @IsString()
  password: string
}
