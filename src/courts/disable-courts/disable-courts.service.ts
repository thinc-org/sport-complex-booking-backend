import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { performance } from 'perf_hooks';
import { CreateDisableCourtDTO, CreateDisableTimeDTO, EditDisableCourtDTO, QueryResult } from './disable-courts.dto';
import { DisableCourt, DisableTime } from './interfaces/disable-courts.interface';

@Injectable()
export class DisableCourtsService {
    constructor(@InjectModel('DisableCourt') private readonly disableCourtModel: Model<DisableCourt>) { }
    async createDisableCourt(data: CreateDisableCourtDTO): Promise<DisableCourt> {
        
        if (!this.verifyStartAndEndDate(data.starting_date, data.expired_date))
        throw new HttpException('starting_date cannot be after expired_date', HttpStatus.BAD_REQUEST);
        if (!this.verifyDisableTimes(data.disable_time))
        throw new HttpException('there is an invalid DisableTime', HttpStatus.BAD_REQUEST);
        
        data.expired_date.setUTCHours(23, 0, 0, 0);
        let disableCourt = this.disableCourtfromCreateDTO(data);
        
        let overlaps = await this.findOverlap(disableCourt);
        if (overlaps.length != 0) {
            throw new HttpException({ statusCode: HttpStatus.CONFLICT, message: 'There are some overlapping times', overlaps }, HttpStatus.CONFLICT);
        }

        return await disableCourt.save();
    }

    async queryDisableCourt(q_starting_date: string, q_expired_date: string, q_sport_id: string, q_court_num: string, start: number, end: number, lean: boolean): Promise<QueryResult> {
        let query: any = this.disableCourtModel.find();

        if (q_starting_date != null) query = query.find({ starting_date: { $gte: new Date(q_starting_date) } });
        if (q_expired_date != null) query = query.find({ expired_date: { $lte: new Date(q_expired_date) } });
        if (q_sport_id != null) query = query.find({ sport_id: q_sport_id });
        if (q_court_num != null) query = query.find({ court_num: Number.parseInt(q_court_num) });

        if (lean === true) query.select('-disable_time');

        // populate sport_id field
        //await query.populate('sport_id');

        const results = await query.exec();

        if (isNaN(start)) start = 0;
        if (start >= results.length) start = results.length;
        if (isNaN(end) || end >= results.length) end = results.length - 1;
        const sliced_results = results.slice(start, end + 1);

        return {
            total_found: results.length,
            total_returned: sliced_results.length, // included to avoid confusion with total_found
            sliced_results: sliced_results
        };
    }

    async getDisableCourt(id: string): Promise<DisableCourt> {
        let disableCourt = await this.disableCourtModel.findById(id);
        if (disableCourt == null)
            throw new HttpException("Cannot find DisableCourt with id: " + id, HttpStatus.NOT_FOUND);
        return disableCourt;
    }

    async deleteAllDisableCourt(): Promise<void> {
        await this.disableCourtModel.deleteMany({});
    }

    async deleteDisableCourt(id: string): Promise<void> {
        await this.disableCourtModel.deleteOne({ _id: id });
    }

    async editDisableCourt(id: string, data: EditDisableCourtDTO): Promise<DisableCourt> {
        data.expired_date.setUTCHours(23, 0, 0, 0);

        let disableCourt = await this.disableCourtModel.findById(id);

        if (disableCourt == null)
            throw new HttpException("Cannot find DisableCourt with id: " + id, HttpStatus.NOT_FOUND);

        disableCourt = this.disableCourtfromEditDTO(disableCourt, data);

        let overlaps = await this.findOverlap(disableCourt);
        if(overlaps.length != 0) {
            throw new HttpException({ statusCode: HttpStatus.CONFLICT, message: 'There are some overlapping times', overlaps }, HttpStatus.CONFLICT);
        }
        

        if (!this.verifyStartAndEndDate(disableCourt.starting_date, disableCourt.expired_date))
            throw new HttpException('starting_date cannot be after expired_date', HttpStatus.BAD_REQUEST);
        if (!this.verifyDisableTimes(disableCourt.disable_time))
            throw new HttpException('there is an invalid DisableTime', HttpStatus.BAD_REQUEST);

        return await disableCourt.save();
    }

    async addDisableTime(id: string, disable_times: Array<DisableTime>): Promise<void> {
        if (!this.verifyDisableTimes(disable_times))
            throw new HttpException('there is an invalid DisableTime', HttpStatus.BAD_REQUEST);
        let disableCourt = await this.getDisableCourt(id);
        disable_times.forEach(disable_time => {
            disableCourt.disable_time.push(disable_time);
        });
    }

    /*
        find when a court number {court_num} of {sport_id} sport closes on {date}
        return an array of tuple [start :number,end :number]
        each tuple means that the court is closed during interval [start,end]
        ex. [ [90,120], [300,330] ] means the court is closed from 90 to 120 and from 300 to 330
        
        note: 
        The resulting array isn't sorted. 
        There might be some overlaping and/or duplicate intervals, use mergeTimeArr(timeArr) if this is not desired.
    */
    async findClosedTimes(sport_id: string, court_num: number, date: Date): Promise<Array<[number, number]>> {
        // max rps: ~600 rps
        // response time: <10 ms for 1 councurrent user, ~160ms for 100 concurrent user, ~1.6s for 1000 concurrent user

        date.setUTCHours(0, 0, 0);
        let day = date.getDay();

        let results = await this.disableCourtModel.find({ 
            starting_date: { $lte: date }, 
            expired_date: { $gte: date }, 
            sport_id, 
            court_num,
            disable_time: { $elemMatch: {day} }
        }).select('disable_time');

        let timeArr: Array<[number, number]> = [];
        results.forEach(disableCourt => {
            timeArr = timeArr.concat(disableCourt.disable_time.map(disableTime => [disableTime.start_time,disableTime.end_time]));
        });
        return timeArr;
    }

    mergeTimeArr(timeArr: Array<[number, number]>): Array<[number, number]> {
        timeArr.sort((a, b) => {
            if (a[0] != b[0]) return a[0] - b[0];
            else return a[1] - b[1];
        })
        let newTimeArr: Array<[number, number]> = [timeArr[0]];
        for (let interval of timeArr) {
            let top = newTimeArr[newTimeArr.length - 1];
            if (top[1] >= interval[0]) {
                top[1] = interval[1];
            } else {
                newTimeArr.push(interval);
            }
        }
        return newTimeArr;
    }

    /*
        private utility methods
    */

    private async findOverlap(disableCourt: DisableCourt): Promise<Array<string>> {

        let overlaps: string[] = [];
        let queryOrArray = []
        
        for(const disableTime of disableCourt.disable_time) {
            queryOrArray.push({start_time: { $lt: disableTime.end_time }, end_time: { $gt: disableTime.start_time }, day: disableTime.day })
        }

        let results = await this.disableCourtModel.find({ 
            sport_id: disableCourt.sport_id,
            court_num: disableCourt.court_num,
            starting_date: { $lte: disableCourt.expired_date }, 
            expired_date: { $gte: disableCourt.starting_date },
            disable_time: { $elemMatch:{$or: queryOrArray} } 
        }).select("_id");
        results.forEach(disableCourt => overlaps.push(disableCourt._id));

        return overlaps;
    }

    private verifyStartAndEndDate(startDate: Date, endDate: Date): boolean {
        if (startDate == null && endDate == null) return true;
        else return startDate <= endDate;
    }

    private verifyDisableTimes(disable_times: Array<DisableTime>): boolean {
        if (disable_times == null) return true;
        for (let disable_time of disable_times) {
            if (disable_time.start_time > disable_time.end_time) return false;
        }
        return true;
    }

    private disableCourtfromEditDTO(disableCourt: DisableCourt, data: EditDisableCourtDTO): DisableCourt {
        if (data.description != null) disableCourt.description = data.description;
        if (data.sport_id != null) disableCourt.sport_id = data.sport_id;
        if (data.court_num != null) disableCourt.court_num = data.court_num;
        if (data.starting_date != null) disableCourt.starting_date = data.starting_date;
        if (data.expired_date != null) disableCourt.expired_date = data.expired_date;
        if (data.disable_time != null) disableCourt.disable_time = data.disable_time;
        return disableCourt;
    }

    private disableCourtfromCreateDTO(data: CreateDisableCourtDTO): DisableCourt {
        let disableCourt = new this.disableCourtModel();
        disableCourt.description = data.description;
        disableCourt.sport_id = data.sport_id;
        disableCourt.starting_date = data.starting_date;
        disableCourt.expired_date = data.expired_date;
        disableCourt.court_num = data.court_num;
        disableCourt.disable_time = data.disable_time;
        return disableCourt;
    }

    private extractTimes(disableCourt: DisableCourt, day: number, timeArr: Array<[number, number]>): void {
        disableCourt.disable_time.forEach(disable_time => {
            if (disable_time.day === day) {
                timeArr.push([disable_time.start_time, disable_time.end_time]);
            }
        });
    }
}
