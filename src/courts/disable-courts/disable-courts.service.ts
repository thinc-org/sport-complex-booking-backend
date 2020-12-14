import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateDisableCourtDTO, CreateDisableTimeDTO } from './disable-courts.dto';
import { DisableCourt } from './interfaces/disable-courts.interface';

@Injectable()
export class DisableCourtsService {
    constructor(@InjectModel('DisableCourt') private readonly disableCourtModel: Model<DisableCourt>) { }
    async createDisableCourt(data: CreateDisableCourtDTO, merge: boolean): Promise<DisableCourt> {
        let disableCourt = await this.disableCourtModel.findOne({
            sport_name_en: data.sport_name_en,
            starting_date: data.starting_date,
            expired_date: data.expired_date,
            court_num: data.court_num
        });

        if (disableCourt == null) {
            disableCourt = this.disableCourtfromDTO(data);
        }

        if (!merge) disableCourt.disable_time = [];

        data.disable_time.forEach(disable_time => {
            disableCourt.disable_time.push({
                start_time: disable_time.start_time,
                day: disable_time.day,
                end_time: disable_time.end_time
            });
        });

        return await disableCourt.save();
    }

    async getAllDisableCourt(): Promise<DisableCourt[]> {
        return await this.disableCourtModel.find({});
    }

    async getDisableCourt(id: string): Promise<DisableCourt> {
        return await this.disableCourtModel.findById(id);
    }

    async deleteAllDisableCourt(): Promise<void>{
        await this.disableCourtModel.deleteMany({});
    }

    async deleteDisableCourt(id: string): Promise<void> {
        await this.disableCourtModel.deleteOne({_id: id});
    }

    async findClosedTimes(sport_name_en: string, court_num: number, date: Date): Promise<Array<[number,number]>>{
        date.setUTCHours(0,0,0);
        let results = await this.disableCourtModel.find({sport_name_en, court_num, starting_date: {$lte: date}, expired_date: {$gte: date} });
        console.log(results);
        let timeArr: Array<[number,number]> = [];
        let day = date.getDay();
        results.forEach(disableCourt => {
            this.extractTimes(disableCourt,day,timeArr);
        });
        return timeArr;
    }

    private disableCourtfromDTO(data: CreateDisableCourtDTO): DisableCourt {
        let disableCourt = new this.disableCourtModel();
        disableCourt.sport_name_en = data.sport_name_en;
        disableCourt.sport_name_th = data.sport_name_th;
        disableCourt.starting_date = data.starting_date;
        disableCourt.expired_date = data.expired_date;
        disableCourt.court_num = data.court_num;
        return disableCourt;
    }

    private extractTimes(disableCourt: DisableCourt, day: number, timeArr: Array<[number,number]>): void{
        disableCourt.disable_time.forEach( disable_time => {
            if(disable_time.day === day){
                timeArr.push([disable_time.start_time,disable_time.end_time]);
            }
        });
    }
}
