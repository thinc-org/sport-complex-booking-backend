import * as mongoose from "mongoose"
import { User } from "src/users/interfaces/user.interface"

export interface Reservation extends mongoose.Document {
  sport_id: mongoose.Types.ObjectId
  court_number: number
  date: Date
  day_of_week: number
  time_slot: number[]
  list_member: mongoose.Types.ObjectId[]
  is_check: boolean
}

export interface PopulatedReservation extends Omit<Reservation, "list_member"> {
  list_member: User[]
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

export interface PopulatedWaitingRoom extends Omit<WaitingRoom, "list_member"> {
  list_member: User[]
}
