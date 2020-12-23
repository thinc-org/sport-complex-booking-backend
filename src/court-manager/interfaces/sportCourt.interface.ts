import * as mongoose from 'mongoose';

export interface Court extends mongoose.Document{
      court_num: number;
      open_time: number; //number in minute from midnight
      close_time: number; //number in minute from midnight
}

export interface List_Sport extends Court{
      sport_name_th: string;
      sport_name_en: string;
      required_user: number;
      quota: number;
      list_court: [Court];
}