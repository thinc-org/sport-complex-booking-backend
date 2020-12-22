import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema, Types } from 'mongoose';

export type FileInfoDocument = FileInfo & Document;

@Schema()
export class FileInfo {
    @Prop()
    file_name: string;

    @Prop()
    ext: string;

    @Prop()
    full_path: string;

    @Prop()
    file_type: string;

    @Prop({ type: MongooseSchema.Types.ObjectId})
    owner:  Types.ObjectId
}

export const FileInfoSchema = SchemaFactory.createForClass(FileInfo);