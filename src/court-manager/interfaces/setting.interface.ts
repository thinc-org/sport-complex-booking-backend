import * as mongoose from 'mongoose';

export interface Setting extends mongoose.Document{
      waiting_room_duration: number;      //Number of minute, default = 15 mins
      late_cancelation_punishment: number;      //Number of days, default = 30 days
      absence_punishment: number;   //Number of days, default = 30 days
      late_cancelation_day: number; //Number of days, default = 2 days
}