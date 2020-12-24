
import * as mongoose from "mongoose";

export interface Reservation extends mongoose.Document {
    sport_id : mongoose.Types.ObjectId
    court_number : Number
    date : Date
    time_slot : Number[]
    list_member : mongoose.Types.ObjectId[]
    is_check : Boolean
}
export interface WaitingRoom extends mongoose.Document {
    sport_id : mongoose.Types.ObjectId
    court_number : Number
    date : Date
    time_slot : Number[]
    list_member : mongoose.Types.ObjectId[]
    access_code : String
    expired_date : Date
}