import { Document } from "mongoose";

export interface DisableTime {
    start_time: number
    end_time: number
    day: number
}

export interface DisableCourt extends Document {
    sport_name_th: string
    sport_name_en: string
    court_num: number
    starting_date: Date
    expired_date: Date
    disable_time: Array<DisableTime>
}