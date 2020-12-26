
import * as mongoose from "mongoose";

export interface Reservation extends mongoose.Document {
    sport_id : mongoose.Types.ObjectId
    court_number : number
    date : Date
    day_of_week : number
    time_slot : number[]
    list_member : mongoose.Types.ObjectId[]
    is_check : boolean
}
export interface WaitingRoom extends mongoose.Document {
    sport_id : mongoose.Types.ObjectId
    court_number : number
    date : Date
<<<<<<< HEAD
    day_of_week : number
    time_slot : number[]
||||||| parent of 0942526... fix(RESERVATION) : add day field in schema
    time_slot : Booking_time[]
=======
    day : Number
    time_slot : Number[]
>>>>>>> 0942526... fix(RESERVATION) : add day field in schema
    list_member : mongoose.Types.ObjectId[]
    access_code :string
    expired_date : Date
}