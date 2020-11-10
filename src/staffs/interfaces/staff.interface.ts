import * as mongoose from 'mongoose';
export interface Staff extends mongoose.Document {
  name: string;
  surname: string;
  username: string;
  password: string;
  is_admin: boolean;
}