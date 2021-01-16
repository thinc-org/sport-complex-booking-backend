import * as mongoose from "mongoose"

export const SsoContentSchema = new mongoose.Schema({
  email: String,
  firstname: String,
  firstnameth: String,
  gecos: String,
  lastname: String,
  lastnameth: String,
  ouid: String,
  roles: Object,
  uid: String,
  username: String,
})
