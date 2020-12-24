import * as mongoose from 'mongoose';

export interface Court extends mongoose.Document{
      court_num: number;
      open_time: number; //number in slots from midnight (1slot = 30min)
      close_time: number; //number in slots from midnight (1slot = 30min)
}

export interface Sport extends Court{
      sport_name_th: string;
      sport_name_en: string;
      required_user: number;
      quota: number;
      list_court: Court[];
}