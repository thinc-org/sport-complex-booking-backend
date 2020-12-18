import * as mongoose from "mongoose";

export class CreateMyWaitingRoomDto extends mongoose.Document {
    //Sport_name : String 
    court_number : Number
    date : Date
    time_slot :[{
        start_time : Number
        end_time : Number
    }]
}