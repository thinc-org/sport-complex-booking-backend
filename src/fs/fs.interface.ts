import { Multer } from "multer";

export interface UploadedFiles {
    user_photo?: Array<Express.Multer.File>
    medical_certificate?: Array<Express.Multer.File>
    national_id_house_registration?: Array<Express.Multer.File>
    relationship_verification_document?: Array<Express.Multer.File>
    payment_slip?: Array<Express.Multer.File>
}