import { Types } from "mongoose";

export class firstClass{
    my_reservation_id : Types.ObjectId
    sport_name : String
    court_num : Number
    time_slot : Number[]
    date : Date
}

export class secondClass{
    list_member_id : Types.ObjectId[]
    list_member_name : String[]
}

export class MyReservationDto {
    first : firstClass
    second : secondClass
}