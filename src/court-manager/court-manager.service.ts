import { Injectable, HttpException, HttpStatus, BadRequestException } from '@nestjs/common';
import {Court, Sport} from './interfaces/sportCourt.interface';
import {Setting} from './interfaces/setting.interface';
import { Model, isValidObjectId } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class CourtManagerService {
      constructor(
            @InjectModel('Sport') private Sport: Model<Sport>,
            @InjectModel('Courts') private Court : Model<Court>,
            @InjectModel('Setting') private Setting: Model<Setting>
      ){}

//might get deleted, no error handling
async write_setting() : Promise<Setting>{
      const setting= {
            "waiting_room_duration": 15,
            "late_cancelation_punishment": 30,
            "absence_punishment": 30,
            "late_cancelation_day": 2
      };
      const court_setting = new this.Setting(setting);
      return court_setting.save();
}

async update_setting( new_setting: Setting) : Promise<Setting>{
      return await this.Setting.findOneAndUpdate({}, new_setting, {new:true});
}

async get_setting() : Promise<Setting>{
      return await this.Setting.findOne({});
}

//function: get all Sport from db
async find_allSport() : Promise<Sport[]>{
      return await this.Sport.find({});
}

async find_Sport_byID(id: string) : Promise<Sport>{
      if(!isValidObjectId(id)){
            throw new HttpException("Invalid Id.", HttpStatus.BAD_REQUEST);
      }
      const doc = await this.Sport.findById(id);
      if(!doc){
            throw new BadRequestException("This Id does not exist.")
      }
      return doc;
}

//create sport by Sport (schema)      
async create_Sport(court_data: Sport) : Promise<Sport>{
      const doc = await this.Sport.findOne({sport_name_th: court_data.sport_name_th});     
      if(doc){
            throw new BadRequestException("This Sport already exist.");
      }
      const setTime = new this.Sport(court_data);
      return setTime.save()      
}

//update only sport setting, not court's setting
async update_Sport(sportID: string, newSportSetting: Sport) : Promise<Sport>{
      const Sport = await this.find_Sport_byID(sportID);
      Sport.required_user = newSportSetting.required_user;
      Sport.quota = newSportSetting.quota;
      
      return await Sport.save();
}

//delete sport by its _id
async delete_Sport(sportID: string): Promise<Sport>{
      if(!isValidObjectId(sportID)){
            throw new HttpException("Invalid Id.", HttpStatus.BAD_REQUEST);
      }
      const deleted_sport = await this.Sport.findByIdAndDelete(sportID);
      if(!deleted_sport){
            throw new HttpException('No document for this sport.', HttpStatus.BAD_REQUEST);
      }
      return deleted_sport;
}

async sportRegexQuery(start: number, end: number, search_filter: string) : Promise<{allSport_length: number,sport_list: Sport[]}>{
      if(start<0 || end<start){
            throw new HttpException("Invalid start or end number.", HttpStatus.BAD_REQUEST);
      }
      const list_doc = await this.Sport.find({sport_name_th: new RegExp(search_filter,'i')});

      if(end>= list_doc.length){
            end = list_doc.length;
      }
      const allSport_length = list_doc.length;  //every sports in a query (not yet sliced)

      
      return {allSport_length: allSport_length, sport_list: list_doc.slice(start, end)};
}

//update a court by court number and its data 
async update_CourtbyID(sportID: string, newSetting: Court[]) : Promise<Sport>{
      const doc = await this.find_Sport_byID(sportID);
      doc.list_court = newSetting;
      return await doc.save();
}

}