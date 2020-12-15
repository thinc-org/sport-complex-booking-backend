import { Document, Mongoose, Types } from "mongoose";

export interface DisableTime {
    start_time: number
    end_time: number
    day: number
}

export interface DisableCourt extends Document {
    sport_id: Types.ObjectId
    court_num: number
    starting_date: Date
    expired_date: Date
    disable_time: Array<DisableTime>
}