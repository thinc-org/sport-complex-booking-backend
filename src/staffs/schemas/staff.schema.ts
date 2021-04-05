import * as mongoose from "mongoose"

export const StaffSchema = new mongoose.Schema({
  name: String,
  surname: String,
  username: String,
  password: String,
  is_admin: Boolean,
})
