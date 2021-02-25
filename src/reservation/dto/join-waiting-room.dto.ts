import { ApiProperty } from "@nestjs/swagger"
import { IsBoolean, IsString } from "class-validator"

export class JoinWaitingRoomDto {
  @ApiProperty()
  @IsString()
  access_code: string
}

export class JoinWaitingRoomSuccessDto {
  @ApiProperty()
  @IsBoolean()
  isReservationCreated: boolean
}
