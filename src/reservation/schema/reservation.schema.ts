import * as mongoose from "mongoose";

const Booking_time = new mongoose.Schema({
    start_time : Number,
    end_time : Number
});

export const ReservationSchema = new mongoose.Schema({
    sport_id : mongoose.Types.ObjectId,
    court_number : Number,
    date : Date,
    time_slot : [Booking_time],
    list_member : [mongoose.Types.ObjectId],
    is_check : Boolean
});

export const SuccesfulReservationSchema = new mongoose.Schema({
    is_check : Boolean
});

export const MyWaitingRoomSchema = new mongoose.Schema({
    access_code : String,
    expired_date : Date
});