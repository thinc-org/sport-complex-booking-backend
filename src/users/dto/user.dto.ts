import { Exclude, Type } from "class-transformer";
import { IsBoolean, IsDate, IsEmail, IsNotEmpty, IsString, ValidateNested } from "class-validator";
import { User } from "../interfaces/user.interface";

export class UserDTO {
    @Exclude()
    password: string;
    _id: string;
    constructor(user: Partial<User>) {
        const userJSON = user.toJSON({ getters: true, virtuals: true });
        Object.assign(this, JSON.parse(JSON.stringify(userJSON)));
    }
}

export class CreateUserResponseDTO {
    user: UserDTO;
    jwt: string;
    constructor(user: Partial<User>, jwt: string) {
        this.jwt = jwt;
        this.user = new UserDTO(user);
    }
}

export class CreateContactPersonDTO {
    @IsString()
    contact_person_prefix: string

    @IsString()
    contact_person_name: string

    @IsString()
    contact_person_surname: string

    @IsString()
    contact_person_home_phone: string

    @IsString()
    contact_person_phone: string
}

export class CreateOtherUserDTO {
    @IsEmail()
    username: string // email (cannot change)

    @IsString()
    membership_type: string

    @IsString()
    password: string //pass=phone(editable)

    @IsBoolean()
    is_thai_language: boolean

    @IsString()
    prefix: string

    @IsString()
    name_th: string

    @IsString()
    surname_th: string

    @IsString()
    name_en: string

    @IsString()
    surname_en: string

    @Type(() => Date)
    @IsDate()
    birthday: Date

    @IsString()
    national_id: string

    @IsString()
    gender: string

    @IsString()
    marital_status: string

    @IsString()
    address: string

    @IsString()
    phone: string

    @IsString()
    home_phone: string

    @IsString()
    @IsEmail()
    personal_email: string

    @IsNotEmpty()
    @Type(() => CreateContactPersonDTO)
    @ValidateNested()
    contact_person: CreateContactPersonDTO

    @IsString()
    medical_condition: string
}