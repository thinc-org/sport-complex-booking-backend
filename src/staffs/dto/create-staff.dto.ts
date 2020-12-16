import * as mongoose from 'mongoose';
export class CreateStaffDto extends mongoose.Document {
    readonly name: string
    readonly surname: string
    readonly username: string
    password: string
    readonly is_admin: boolean
  }