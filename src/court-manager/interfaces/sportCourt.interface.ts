import * as mongoose from "mongoose"

export interface Court extends mongoose.Document {
  court_num: number
  open_time: number //number in slots from midnight (1slot = 1hr) ex. open 8am => time slot = 9
  close_time: number //number in slots from midnight (1slot = 1hr) ex.close 8pm => time slot = 20
}

export interface Sport extends Court {
  sport_name_th: string
  sport_name_en: string
  required_user: number
  quota: number
  list_court: Court[]
}
