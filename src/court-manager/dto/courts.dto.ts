import { Court } from "./../interfaces/sportCourt.interface"
import { IsString } from "class-validator"
import { ApiProperty } from "@nestjs/swagger"
import { IsNumber } from "class-validator"
export class SettingDTO {
  @ApiProperty()
  @IsNumber()
  waiting_room_duration: number
  @ApiProperty()
  @IsNumber()
  late_cancelation_punishment: number
  @ApiProperty()
  @IsNumber()
  absence_punishment: number
  @ApiProperty()
  @IsNumber()
  late_cancelation_day: number
}

export class CourtDTO {
  @ApiProperty()
  @IsNumber()
  court_num: number
  @ApiProperty()
  @IsNumber()
  open_time: number
  @ApiProperty()
  @IsNumber()
  close_time: number
}

export class SportDTO extends CourtDTO {
  @ApiProperty()
  @IsString()
  sport_name_th: string
  @ApiProperty()
  @IsString()
  sport_name_en: string
  @ApiProperty()
  @IsNumber()
  required_user: number
  @ApiProperty()
  @IsNumber()
  quota: number
  @ApiProperty()
  list_court: CourtDTO[]
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
}

export class SearchResultDTO {
  @ApiProperty()
  @IsNumber()
  allSport_length: number
  @ApiProperty()
  sport_list: SportDTO[]
}

export class UpdateSportDTO {
  @ApiProperty()
  @IsString()
  sport_id: string
  @ApiProperty()
  new_setting: Court[]
}
