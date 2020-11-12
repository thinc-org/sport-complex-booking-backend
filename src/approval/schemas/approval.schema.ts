import * as mongoose from 'mongoose';


const accountSchemaType = {type: String, enum:['CuStudent','SatitAndCuPersonel','Other']};
const verificationSchemaType = {type: String, enum: ['NotSubmitted','Submitted','Verified','Rejected']};

export const OtherSchema = new mongoose.Schema({
    account_type: accountSchemaType,
    is_thai_language: Boolean,
    prefix: String, //(เพื่อแสดง นาย/นาง/นางสาว)
    name_en: String,
    surname_en: String,
    name_th: String,
    surname_th: String,
    birthday: Date, //(use this for cal age)
    national_id: String, //(also pasport no in foreign) 
    gender: String,
    marital_status: String,
    address: String,
    phone: String,
    home_phone: String,
    personal_email: String,
    contact_person: {
        contact_person_prefix: String,
        contact_person_name: String,
        contact_person_surname: String,
        contact_person_home_phone: String,
        contact_person_phone: String,
    },
    medical_condition: String,
    membership_type: String,
    username: String, //username=email (cannot change)
    password: String, //pass=phone(editable)
    is_penalize: Boolean,
    expired_penalize_date: Date,
    verification_status: verificationSchemaType,
    rejected_info: [String],
    account_expiration_date :Date,
    user_photo: mongoose.Schema.Types.ObjectId, //(ของcollectionที่เก็บรูป)
    medical_ceritficate: mongoose.Schema.Types.ObjectId,
    national_id_photo: mongoose.Schema.Types.ObjectId, //also passport photo
    house_registration_number: mongoose.Schema.Types.ObjectId,//with reference person
    relationship_verification_document: mongoose.Schema.Types.ObjectId,
});