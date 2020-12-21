import { Body, Controller, Get, Post, Put, Param } from '@nestjs/common';
import {CourtManagerService} from './court-manager.service';
import { List_Sport, Court } from './interfaces/sportCourt.interface';
import {Setting} from './interfaces/setting.interface';

@Controller('court-manager')
export class CourtManagerController {
      constructor(private readonly courtManagerService: CourtManagerService){}

//might get deleted, no error handling
@Post('/setting')
async postSetting(@Body() setting: Setting) : Promise<Setting>{
      return await this.courtManagerService.write_setting(setting);
}

//get all list sport
@Get('/getAll')      
async getAllSportCourt() : Promise<List_Sport[]>{
      return await this.courtManagerService.find_allSportList();
}

//Get sport by english name
@Get('/getSport')
async getSportList(@Body() id : {"id": string}) : Promise<List_Sport>{
      return await this.courtManagerService.find_SportList_byID(id.id);
}

//create new document for each sport using body as List sport
@Post('/')    
async createSportList(@Body() court_data: List_Sport): Promise<List_Sport>{
      return await this.courtManagerService.create_SportList(court_data);
}

//Param is sportType ex. Basketball (in english)
@Put('/court-setting/update')     
async changeCourtSetting( @Body() new_court: {"sport_id": string, "new_setting": [Court]}) : Promise<List_Sport>{
     return await this.courtManagerService.update_CourtbyID(new_court.sport_id, new_court.new_setting);
}

}
