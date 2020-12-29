import { StaffManagerService } from './../staffs/staff-manager/staff-manager.service';
import { UserGuard } from './../auth/jwt.guard';
import { JwtAuthGuard, StaffGuard } from 'src/auth/jwt.guard';
import { Body, Controller, Get, Post, Delete, Put, Param, UseGuards, Req } from '@nestjs/common';
import {CourtManagerService} from './court-manager.service';
import { Sport, Court } from './interfaces/sportCourt.interface';
import {Setting} from './interfaces/setting.interface';
import { listAllUserService } from './../staffs/list-all-user/list-all-user.service';

@Controller('court-manager')
export class CourtManagerController {
      constructor(private readonly courtManagerService: CourtManagerService,
            private readonly listAllUserService: listAllUserService, 
            private readonly StaffManagerService: StaffManagerService
      ){}

//might get deleted, no error handling
@UseGuards(StaffGuard)
@Post('setting')
async postSetting(@Req() req) : Promise<Setting>{
      return await this.courtManagerService.writeSetting();
}

@UseGuards(StaffGuard)
@Put('setting')
async updateSetting( @Body() new_setting: Setting, @Req() req) : Promise<Setting>{
      return await this.courtManagerService.updateSetting(new_setting);
}

@UseGuards(StaffGuard)
@Get('setting')
async getSetting(@Req() req):Promise<Setting>{
      return await this.courtManagerService.getSetting();
}

//Get sport by thai name (regex)
@UseGuards(StaffGuard)
@Get('/')      
async getSportList(@Body() input: {start:number, end:number, search_filter: string} ,@Req() req) : 
      Promise<{allSport_length: number,sport_list: Sport[]}>{
     
      return await this.courtManagerService.sportRegexQuery(input.start, input.end, input.search_filter);
}

@UseGuards(JwtAuthGuard)
@Get('/getSports')
async getAllSportList(@Req() req) :Promise<Sport[]>{
      //check if user or staff exists + error handling
      if(req.user.isStaff === false){     
            this.listAllUserService.getUserById(req.user.userId); //err handled in the function
      }
      if(req.user.isStaff === true){
            this.StaffManagerService.getStaffData(req.user.userId); //err handled in the function
      }
      return await this.courtManagerService.findAllSport();
}

//can be use for courts displaying 
@UseGuards(StaffGuard)
@Get('/:id')
async getSport(@Param('id') id: string , @Req() req) : Promise<Sport>{
      return await this.courtManagerService.findSportByID(id);
}

//create new document for each sport using body as sport
@UseGuards(StaffGuard)
@Post('/')    
async createSport(@Body() sport_data: Sport, @Req() req): Promise<Sport>{
      return await this.courtManagerService.createSport(sport_data);
}

//for updating sport_name_th, sport_name_en, quotas, required_users
@UseGuards(StaffGuard)
@Put('/:id')
async updateSport(@Param('id') id: string,@Body() sport_data: {sport_name_th: string, sport_name_en: string, 
      required_user: number, quota: number}, @Req() req): Promise<Sport>{

      return await this.courtManagerService.updateSport(id, sport_data);
}

//delete sport by sport's _id 
@UseGuards(StaffGuard)
@Delete(':id')
async deleteSport(@Param('id') id: string, @Req() req): Promise<Sport>{
      return await this.courtManagerService.deleteSport(id);
}

//Param is sportType ex. Basketball (in english)
@UseGuards(StaffGuard)
@Put('court-setting/update')     
async changeCourtSetting( @Body() new_court: {"sport_id": string, "new_setting": Court[]}, @Req() req) : Promise<Sport>{

     return await this.courtManagerService.updateCourtbyID(new_court.sport_id, new_court.new_setting);
}

}

