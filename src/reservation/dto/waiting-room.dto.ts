import * as mongoose from 'mongoose';

export class WaitingRoomDto extends mongoose.Document {
    sport_id : mongoose.Types.ObjectId
    court_number : Number
    date : Date
    time_slot : Number[]
}