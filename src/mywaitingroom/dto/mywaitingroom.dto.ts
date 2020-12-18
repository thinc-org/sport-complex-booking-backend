import * as mongoose from "mongoose";

export class CreateMyWaitingRoomDto extends mongoose.Document {
    sport_id : mongoose.Types.ObjectId // Generation by finding the ID in sport collection.
    //Sport_name : String 
    court_number : Number
    date : Date
    time_slot :[{
        start_time : Number
        end_time : Number
    }]
    list_member : [mongoose.Types.ObjectId] // Delete.
    access_code : String // Auto generation.
    expired_date : Date // Auto calculation.
}