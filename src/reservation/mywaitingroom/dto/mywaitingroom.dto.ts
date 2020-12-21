
import * as mongoose from "mongoose";

export class CreateWaitingRoomDto extends mongoose.Document {
    //Sport_name : String 
    court_number : Number
    date : Date
    time_slot :[{
        start_time : Number
        end_time : Number
    }]
}

export class CreateReservationDto {
    sport_id : mongoose.Types.ObjectId
    court_number : Number
    date : Date
    time_slot : {
        start_time : Number
        end_time : Number
    }[]
    list_member : mongoose.Types.ObjectId[]
    access_code : String
    expired_date : Date
    is_check : Boolean
}