import * as mongoose from 'mongoose';

export const Admin_and_staffSchema = new mongoose.Schema({
    name: String,
    surname: String,
    username: String,
    password: String,
    is_admin: Boolean,
});