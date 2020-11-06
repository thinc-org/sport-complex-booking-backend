import * as mongoose from 'mongoose';

export const StaffsSchema = new mongoose.Schema({
    name: String,
    surname: String,
    username: String,
    passworf: String,
    is_admin: Boolean,
});