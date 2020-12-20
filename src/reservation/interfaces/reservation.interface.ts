import * as mongoose from "mongoose";

export interface Reservation extends mongoose.Document {
    sport_id : mongoose.Types.ObjectId
    court_number : Number
    date : Date
    time_slot : [{
        start_time : Number
        end_time : Number
    }]
    list_member : [mongoose.Types.ObjectId]
    access_code : String
    expired_date : Date
}

export interface SuccesfulReservation extends Reservation {
    is_check : Boolean
}

export interface MyWaitingRoom extends Reservation {
    access_code : String,
    expired_date : Date
}