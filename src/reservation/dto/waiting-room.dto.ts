import * as mongoose from 'mongoose';

export interface Booking_time {
    start_time : Number,
    end_time : Number
}

export class WaitingRoomDto extends mongoose.Document {
    sport_id : mongoose.Types.ObjectId
    court_number : Number
    date : Date
    time_slot : Booking_time[]
}