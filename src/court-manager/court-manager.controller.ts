import { JwtAuthGuard, StaffGuard } from 'src/auth/jwt.guard';
import { Body, Controller, Get, Post, Delete, Put, Patch, Param, UseGuards, Req, HttpException,
HttpStatus } from '@nestjs/common';
import {CourtManagerService} from './court-manager.service';
import { Sport, Court } from './interfaces/sportCourt.interface';
import {Setting} from './interfaces/setting.interface';

@UseGuards(StaffGuard)
@Controller('court-manager')
export class CourtManagerController {
      constructor(private readonly courtManagerService: CourtManagerService){}

//might get deleted, no error handling
@Post('setting')
async postSetting(@Req() req) : Promise<Setting>{
      return await this.courtManagerService.write_setting();
}

@UseGuards(JwtAuthGuard)
@Put('setting')
async updateSetting( @Body() new_setting: Setting, @Req() req) : Promise<Setting>{
      return await this.courtManagerService.update_setting(new_setting);
}

@Get('setting')
async getSetting(@Req() req):Promise<Setting>{
      return await this.courtManagerService.get_setting();
}

//Get sport by thai name (regex)
@Get('/')      
async getSportList(@Body() input: {start:number, end:number, search_filter: string} ,@Req() req) : 
      Promise<{allSport_length: number,sport_list: Sport[]}>{
      return await this.courtManagerService.sportRegexQuery(input.start, input.end, input.search_filter);
}



//can be use for courts displaying 
@Get('/:id')
async getSport(@Param('id') id: string , @Req() req) : Promise<Sport>{
      return await this.courtManagerService.find_Sport_byID(id);
}

//create new document for each sport using body as sport
@Post('/')    
async createSport(@Body() sport_data: Sport, @Req() req): Promise<Sport>{
      return await this.courtManagerService.create_Sport(sport_data);
}

//for updating sport_name_th, sport_name_en, quotas, required_users
@Put('/:id')
async updateSport(@Param('id') id: string,@Body() sport_data: {sport_name_th: string, sport_name_en: string, 
      required_user: number, quota: number}, @Req() req): Promise<Sport>{

      return await this.courtManagerService.update_Sport(id, sport_data);
}

//delete sport by sport's _id 
@Delete(':id')
async deleteSport(@Param('id') id: string, @Req() req): Promise<Sport>{
      return await this.courtManagerService.delete_Sport(id);
}

//Param is sportType ex. Basketball (in english)
@Put('court-setting/update')     
async changeCourtSetting( @Body() new_court: {"sport_id": string, "new_setting": Court[]}, @Req() req) : Promise<Sport>{
      if(!req.user.isStaff){ 
            throw new HttpException('Staff or Admin only', HttpStatus.UNAUTHORIZED);
      }
     return await this.courtManagerService.update_CourtbyID(new_court.sport_id, new_court.new_setting);
}

}

