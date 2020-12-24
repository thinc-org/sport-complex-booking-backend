import { JwtAuthGuard } from 'src/auth/jwt.guard';
import { Body, Controller, Get, Post, Put, Param, UseGuards, Req, HttpException,
HttpStatus } from '@nestjs/common';
import {CourtManagerService} from './court-manager.service';
import { Sport, Court } from './interfaces/sportCourt.interface';
import {Setting} from './interfaces/setting.interface';

@Controller('court-manager')
export class CourtManagerController {
      constructor(private readonly courtManagerService: CourtManagerService){}

//might get deleted, no error handling
@UseGuards(JwtAuthGuard)
@Post('setting')
async postSetting(@Req() req) : Promise<Setting>{
      if(!req.user.isStaff){ 
            throw new HttpException('Staff or Admin only', HttpStatus.UNAUTHORIZED);
      }
      return await this.courtManagerService.write_setting();
}

@UseGuards(JwtAuthGuard)
@Put('setting')
async updateSetting( @Body() new_setting: Setting, @Req() req) : Promise<Setting>{
      if(!req.user.isStaff){ 
            throw new HttpException('Staff or Admin only', HttpStatus.UNAUTHORIZED);
      }
      return await this.courtManagerService.update_setting(new_setting);
}

@UseGuards(JwtAuthGuard)
@Get('setting')
async getSetting(@Req() req):Promise<Setting>{
      if(!req.user.isStaff){ 
            throw new HttpException('Staff or Admin only', HttpStatus.UNAUTHORIZED);
      }
      return await this.courtManagerService.get_setting();
}

//get all sport
@UseGuards(JwtAuthGuard)
@Get('getAll')      
async getAllSportCourt(@Req() req) : Promise<Sport[]>{
      if(!req.user.isStaff){ 
            throw new HttpException('Staff or Admin only', HttpStatus.UNAUTHORIZED);
      }
      return await this.courtManagerService.find_allSport();
}

//Get sport by thai name (regex)
@UseGuards(JwtAuthGuard)
@Get('/')      
async getSportList(@Body() input: {start:number, end:number, search_filter: string} ,@Req() req) : 
      Promise<{allSport_length: number,sport_list: Sport[]}>{
      if(!req.user.isStaff){ 
            throw new HttpException('Staff or Admin only', HttpStatus.UNAUTHORIZED);
      }
      return await this.courtManagerService.sportRegexQuery(input.start, input.end, input.search_filter);
}



//can be use for courts displaying 
@UseGuards(JwtAuthGuard)
@Get('getSportbyID')
async getSport(@Body() id : {id: string}, @Req() req) : Promise<Sport>{
      if(!req.user.isStaff){ 
            throw new HttpException('Staff or Admin only', HttpStatus.UNAUTHORIZED);
      }
      return await this.courtManagerService.find_Sport_byID(id.id);
}

//create new document for each sport using body as sport
@UseGuards(JwtAuthGuard)
@Post('/')    
async createSport(@Body() sport_data: Sport, @Req() req): Promise<Sport>{
      if(!req.user.isStaff){ 
            throw new HttpException('Staff or Admin only', HttpStatus.UNAUTHORIZED);
      }
      return await this.courtManagerService.create_Sport(sport_data);
}

//for updating sport_name_th, sport_name_en, quotas, required_users
@UseGuards(JwtAuthGuard)
@Put('/:id')
async updateSport(@Param('id') id: string,@Body() sport_data: Sport, @Req() req): Promise<Sport>{
      if(!req.user.isStaff){ 
            throw new HttpException('Staff or Admin only', HttpStatus.UNAUTHORIZED);
      }
      return await this.courtManagerService.update_Sport(id, sport_data);
}

//delete sport by sport's _id 
@UseGuards(JwtAuthGuard)
@Put('/delete/:id')
async deleteSport(@Param('id') id: string, @Req() req): Promise<Sport>{
      if(!req.user.isStaff){ 
            throw new HttpException('Staff or Admin only', HttpStatus.UNAUTHORIZED);
      }
      return await this.courtManagerService.delete_Sport(id);
}

//Param is sportType ex. Basketball (in english)
//maybe fix this for hk, sending only one Court. If not, will have to create delete and update time slot for each court
//court number cant be repeated
@UseGuards(JwtAuthGuard)
@Put('court-setting/update')     
async changeCourtSetting( @Body() new_court: {"sport_id": string, "new_setting": Court[]}, @Req() req) : Promise<Sport>{
      if(!req.user.isStaff){ 
            throw new HttpException('Staff or Admin only', HttpStatus.UNAUTHORIZED);
      }
     return await this.courtManagerService.update_CourtbyID(new_court.sport_id, new_court.new_setting);
}

}

