import { Prop, Schema, SchemaFactory, raw } from '@nestjs/mongoose';
import { Document, PromiseProvider, Schema as MongooseSchema} from 'mongoose';

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
    owner:  MongooseSchema.Types.ObjectId 
}

export const FileInfoSchema = SchemaFactory.createForClass(FileInfo);