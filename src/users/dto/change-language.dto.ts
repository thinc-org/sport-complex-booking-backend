import { ApiProperty } from "@nestjs/swagger"
import { IsBoolean } from "class-validator"

export class ChangeLanguageDto {
  @ApiProperty()
  @IsBoolean()
  is_thai_language: boolean
}
