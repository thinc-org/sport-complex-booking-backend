import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose"
import { ApiProperty } from "@nestjs/swagger"
import { Document, Schema as MongooseSchema, Types } from "mongoose"
import { CreateOtherUserDTO } from "src/users/dto/user.dto"
import { OtherUser } from "src/users/interfaces/user.interface"

export type FileInfoDocument = FileInfo & Document

@Schema()
export class FileInfo {
  @ApiProperty()
  @Prop()
  file_name: string

  @ApiProperty()
  @Prop()
  ext: string

  @ApiProperty()
  @Prop()
  full_path: string

  @ApiProperty()
  @Prop()
  file_type: string

  @ApiProperty({
    type: String,
    description: "Id of the owner",
  })
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: "User" })
  owner: OtherUser
}

export const FileInfoSchema = SchemaFactory.createForClass(FileInfo)

export class GenerateTokenResponse {
  @ApiProperty()
  token: string
}
