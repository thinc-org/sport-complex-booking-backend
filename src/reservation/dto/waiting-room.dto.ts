import * as mongoose from "mongoose"

export class WaitingRoomDto extends mongoose.Document {
  sport_id: mongoose.Types.ObjectId
  court_number: number
  date: Date
  time_slot: number[]
}
