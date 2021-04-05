import * as mongoose from "mongoose"

export interface Reservation extends mongoose.Document {
  sport_id: mongoose.Types.ObjectId
  court_number: number
  date: Date
  day_of_week: number
  time_slot: number[]
  list_member: mongoose.Types.ObjectId[]
  is_check: boolean
}
export interface WaitingRoom extends mongoose.Document {
  sport_id: mongoose.Types.ObjectId
  court_number: number
  date: Date
  day_of_week: number
  time_slot: number[]
  list_member: mongoose.Types.ObjectId[]
  access_code: string
  expired_date: Date
}
