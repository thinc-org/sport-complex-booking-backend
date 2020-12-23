import * as mongoose from "mongoose";

interface Booking_time {
    start_time : Number 
    end_time : Number
}

export class MyReservationDto {
    my_reservation_id : mongoose.Types.ObjectId
    sport_name : String
    court_num : Number
    time_slot : Booking_time[]
    list_member_id : mongoose.Types.ObjectId[]
    list_member_name : String[]
}