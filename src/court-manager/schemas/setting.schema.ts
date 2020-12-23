import * as mongoose from 'mongoose';

export const SettingSchema = new mongoose.Schema({
      waiting_room_duration: Number,      //Number of minute, default = 15 mins
      late_cancelation_punishment: Number,      //Number of days, default = 30 days
      absence_punishment: Number,   //Number of days, default = 30 days
      late_cancelation_day: Number, //Number of days, default = 2 days
});