import { Document, Types } from "mongoose"

export interface DisableTime {
  time_slot: Array<number>
  day: number
}

export interface DisableCourt extends Document {
  description: string
  sport_id: Types.ObjectId
  court_num: number
  starting_date: Date
  expired_date: Date
  disable_time: Array<DisableTime>
}
