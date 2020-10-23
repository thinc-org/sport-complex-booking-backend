import { Prop, Schema, SchemaFactory, raw } from '@nestjs/mongoose';
import { Document, PromiseProvider, Schema as MongooseSchema } from 'mongoose';

export type UserDocument = User & Document;

@Schema()
export class User {
    
    @Prop({ required: true, default: true })
    is_cu_student: boolean
    
    @Prop({ required: true, default: true })
    is_thai_language: boolean
    
    @Prop({required: true, default: false})
    is_penalize: boolean
    
    @Prop()
    is_first_login: boolean
    
    @Prop()
    expired_penalize_date: Date

    @Prop()
    name_th: string

    @Prop()
    name_en: string

    @Prop()
    surname_th: string

    @Prop()
    surname_en: string

    @Prop()
    username: string

    @Prop()
    personal_email: string

    @Prop()
    phone: string

    @Prop()
    prefix: string

    @Prop()
    birthday: Date

    @Prop()
    national_id: string

    @Prop()
    gender: string

    @Prop()
    marital_status: string

    @Prop()
    address: string

    @Prop()
    home_phone: string

    @Prop(raw({type: String, enum:['CuStudent','SatitAndCuPersonel','Other']}))
    account_type: Account

    @Prop(raw({
        contact_person_prefix: {type: String},
        contact_person_name: {type: String},
        contact_person_surname: {type: String},
        contact_person_home_phone: {type: String},
        contact_person_phone: {type: String}
    }))
    contact_person: Contact_person

    @Prop()
    medical_condition: string

    @Prop()
    membership_type: string

    @Prop()
    password: string

    @Prop(raw({type: String, enum: ['NotSubmitted','Submitted','Verified','Rejected']}))
    verification_status: Verification

    @Prop()
    rejected_info:  string[]

    @Prop()
    account_expiration_date: Date

    @Prop({ type: MongooseSchema.Types.ObjectId})
    user_photo_file: MongooseSchema.Types.ObjectId

    @Prop({ type: MongooseSchema.Types.ObjectId})
    medical_certificate_file: MongooseSchema.Types.ObjectId

    @Prop({ type: MongooseSchema.Types.ObjectId})
    national_id_file: MongooseSchema.Types.ObjectId

    @Prop({ type: MongooseSchema.Types.ObjectId})
    house_registration_number_file: MongooseSchema.Types.ObjectId

    @Prop({ type: MongooseSchema.Types.ObjectId})
    relationship_verification_document_file: MongooseSchema.Types.ObjectId
}

export enum Verification {
    NotSubmitted = 'NotSubmitted',
    Submitted = 'Submitted',
    Verified = 'Verified',
    Rejected = 'Rejected'
}

export enum Account {
    CuStudent = 'CuStudent',
    SatitAndCuPersonel = 'SatitAndCuPersonel',
    Other = 'Other'
}

export interface Contact_person{
    contact_person_prefix: string
    contact_person_name: string
    contact_person_surname: string
    contact_person_home_phone: string
    contact_person_phone: string
}

export const UserSchema = SchemaFactory.createForClass(User);