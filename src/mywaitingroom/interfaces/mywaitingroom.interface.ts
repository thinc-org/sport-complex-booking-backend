import * as mongoose from "mongoose";

export interface MyWaitingRoom extends mongoose.Document {
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