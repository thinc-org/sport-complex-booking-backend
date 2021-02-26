import { ApiProperty } from "@nestjs/swagger"
import { IsDate, IsNumber } from "class-validator"
import * as mongoose from "mongoose"

export class WaitingRoomDto extends mongoose.Document {
  @ApiProperty({ type: String })
  sport_id: mongoose.Types.ObjectId
  @ApiProperty()
  @IsNumber()
  court_number: number
  @ApiProperty()
  @IsDate()
  date: Date
  @ApiProperty({ type: [Number] })
  time_slot: number[]
}