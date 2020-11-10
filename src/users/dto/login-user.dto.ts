import * as mongoose from 'mongoose';


export class LoginUserDto extends mongoose.Document {
    username: string
    password: string
}