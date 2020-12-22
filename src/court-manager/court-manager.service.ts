import { ConfigModule } from '@nestjs/config';
import { Injectable, HttpException, HttpStatus, BadRequestException } from '@nestjs/common';
import {Court, List_Sport} from './interfaces/sportCourt.interface';
import {Setting} from './interfaces/setting.interface';
import { Model, isValidObjectId } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class CourtManagerService {
      constructor(
            @InjectModel('List_Sport') private List_Sport: Model<List_Sport>,
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
      const setting_doc = await this.Setting.findOneAndUpdate({}, new_setting, {new:true});
      return setting_doc.save();
}

async get_setting() : Promise<Setting>{
      return await this.Setting.findOne({});
}

//function: get all Sport List from db
async find_allSportList() : Promise<List_Sport[]>{
      return await this.List_Sport.find({});
}


async find_SportList_byID(id: string) : Promise<List_Sport>{
      if(!isValidObjectId(id)){
            throw new HttpException("Invalid Id", HttpStatus.BAD_REQUEST);
      }
      const doc = await this.List_Sport.findById(id);
      if(!doc){
            throw new BadRequestException("This Id does not exist.")
      }
      return doc;
}

//create sport list by List_Sport (schema)      
async create_SportList(court_data: List_Sport) : Promise<List_Sport>{
      const doc = await this.List_Sport.findOne({sport_name_en: court_data.sport_name_en});     
      //thai query result is null for some reason
      //const doc_th = await this.List_Sport.find({sport_name_th: court_data.sport_name_th},{ addresses: { $slice: [0, 1] } ,'_id': false});
      
      const setTime = new this.List_Sport(court_data);

      if(!doc){
            return setTime.save()     
      }else{
      throw new BadRequestException("This Sport already exist.");
      }   
           
}

//update a court by court number and its data 
async update_CourtbyID(sportID: string, newSetting: [Court]) : Promise<List_Sport>{
      const doc = await this.find_SportList_byID(sportID);
      doc.list_court = newSetting;
      return await doc.save();
}

}
     

