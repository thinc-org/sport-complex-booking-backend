import * as mongoose from 'mongoose';

export const DisableTimeSchema = new mongoose.Schema({
    start_time: Number,
    end_time: Number,
    day: Number
})

export const DisableCourtSchema = new mongoose.Schema({
    description: String,
    sport_id: {type: mongoose.Schema.Types.ObjectId, ref:'Sport'},
    court_num: Number,
    starting_date: Date,
    expired_date: Date,
    disable_time: [DisableTimeSchema]
})

// indexing DisableCourts by combination of these fields for efficient query
DisableCourtSchema.index({ sport_id: 1, court_num: 1, starting_date: 1, expired_date: 1 });
// for sorting purposes and query without court_num
DisableCourtSchema.index({ starting_date: 1, expired_date: 1, sport_id: 1 });

// multikey index
DisableCourtSchema.index({ disable_time: 1 });

// automatically remove expired document using TTL index
DisableCourtSchema.index({ expired_date: 1 }, { expireAfterSeconds: 0 });

DisableCourtSchema.on('index', error => {
    console.log(error.message);
});