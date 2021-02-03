import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose"
import { Document, Schema as MongooseSchema, Types } from "mongoose"
import { OtherUser } from "src/users/interfaces/user.interface"

export type FileInfoDocument = FileInfo & Document

@Schema()
export class FileInfo {
  @Prop()
  file_name: string

  @Prop()
  ext: string

  @Prop()
  full_path: string

  @Prop()
  file_type: string

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: "User" })
  owner: OtherUser
}

export const FileInfoSchema = SchemaFactory.createForClass(FileInfo)
