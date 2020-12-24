
import { Types , Document} from "mongoose";

export class CreateWaitingRoomDto extends Document {
    //Sport_name : String 
    court_number : Number
    date : Date
    time_slot : Number[]
}

export class CreateReservationDto {
    sport_id : Types.ObjectId
    court_number : Number
    date : Date
    time_slot : Number[]
    list_member : Types.ObjectId[]
    access_code : String
    expired_date : Date
    is_check : Boolean
}