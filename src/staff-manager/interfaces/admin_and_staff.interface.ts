import * as mongoose from 'mongoose';

export interface Admin_and_staff extends mongoose.Document {
  name: string;
  surname: string;
  username: string;
  password: string;
  is_admin: boolean;
}