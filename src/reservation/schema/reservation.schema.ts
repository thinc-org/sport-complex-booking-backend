import * as mongoose from "mongoose"

export const ReservationSchema = new mongoose.Schema({
  sport_id: { type: mongoose.Types.ObjectId, ref: "Sport" },
  court_number: Number,
  date: Date,
  day_of_week: Number,
  time_slot: [Number],
  list_member: [{ type: mongoose.Types.ObjectId, ref: "User" }],
  is_check: Boolean,
})

export const WaitingRoomSchema = new mongoose.Schema({
  sport_id: { type: mongoose.Types.ObjectId, ref: "Sport" },
  court_number: Number,
  date: Date,
  day_of_week: Number,
  time_slot: [Number],
  list_member: [{ type: mongoose.Types.ObjectId, ref: "User" }],
  access_code: String,
  expired_date: Date,
})

// automatically remove expired document using TTL index
WaitingRoomSchema.index({ expired_date: 1 }, { expireAfterSeconds: 0 })
