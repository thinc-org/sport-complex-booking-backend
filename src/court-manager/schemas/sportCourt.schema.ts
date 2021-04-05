import * as mongoose from "mongoose"

export const CourtSchema = new mongoose.Schema({
  court_num: Number,
  open_time: Number, //number in slots from midnight (1slot = 30min)
  close_time: Number, //number in slots from midnight (1slot = 30min)
})

export const SportSchema = new mongoose.Schema({
  sport_name_th: String,
  sport_name_en: String,
  required_user: Number,
  quota: Number,
  list_court: [CourtSchema],
})
