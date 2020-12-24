import * as mongoose from "mongoose";

export class MyReservationDto {
    my_reservation_id : mongoose.Types.ObjectId
    sport_name : String
    court_num : Number
    time_slot : Number[]
    list_member_id : mongoose.Types.ObjectId[]
    list_member_name : String[]
}