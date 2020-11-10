import * as mongoose from 'mongoose';


const verificationSchemaType = {type: String, enum: ['NotSubmitted','Submitted','Verified','Rejected']};

export const UserSchema = new mongoose.Schema({
    is_thai_language: Boolean,
    is_penalize: Boolean,
    expired_penalize_date: Date,
    phone: String,
    personal_email: String,
    name_en: String,
    surname_en: String,
    name_th: String,
    surname_th: String,
    username: String,
},{discriminatorKey: 'account_type'})

export const CuStudentSchema = new mongoose.Schema({
    is_first_login: Boolean,
});

export const SatitCuPersonelSchema = new mongoose.Schema({
    password: String,
});

export const OtherSchema = new mongoose.Schema({
    prefix: String, //(เพื่อแสดง นาย/นาง/นางสาว)
    birthday: Date, //(use this for cal age)
    national_id: String, //(also pasport no in foreign) 
    gender: String,
    marital_status: String,
    address: String,
    home_phone: String,
    contact_person: {
        contact_person_prefix: String,
        contact_person_name: String,
        contact_person_surname: String,
        contact_person_home_phone: String,
        contact_person_phone: String,
    },
    medical_condition: String,
    membership_type: String,
    password: String, //pass=phone(editable)
    verification_status: verificationSchemaType,
    rejected_info: [String],
    account_expiration_date :Date,
    user_photo: mongoose.Schema.Types.ObjectId, //(ของcollectionที่เก็บรูป)
    medical_ceritficate: mongoose.Schema.Types.ObjectId,
    national_id_photo: mongoose.Schema.Types.ObjectId, //also passport photo
    house_registration_number: mongoose.Schema.Types.ObjectId,//with reference person
    relationship_verification_document: mongoose.Schema.Types.ObjectId,
});