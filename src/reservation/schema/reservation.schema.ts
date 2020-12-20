import * as mongoose from "mongoose";

const Booking_time = new mongoose.Schema({
    start_time : Number,
    end_time : Number
});

<<<<<<< HEAD:src/successfulreservation/schema/successfulreservation.schema.ts
export const SuccessfulReservationSchema = new mongoose.Schema({
=======
export const ReservationSchema = new mongoose.Schema({
>>>>>>> dev:src/reservation/schema/reservation.schema.ts
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