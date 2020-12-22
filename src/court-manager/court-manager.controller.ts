import { JwtAuthGuard } from 'src/auth/jwt.guard';
import { Body, Controller, Get, Post, Put, Param, UseGuards, Req, HttpException,
HttpStatus } from '@nestjs/common';
import {CourtManagerService} from './court-manager.service';
import { List_Sport, Court } from './interfaces/sportCourt.interface';
import {Setting} from './interfaces/setting.interface';

@Controller('court-manager')
export class CourtManagerController {
      constructor(private readonly courtManagerService: CourtManagerService){}

//might get deleted, no error handling

@UseGuards(JwtAuthGuard)
@Post('/setting')
async postSetting(Setting, @Req() req) : Promise<Setting>{
      if(req.user.is_admin){
            throw new HttpException('Staff or Admin only', HttpStatus.UNAUTHORIZED);
      }
      return await this.courtManagerService.write_setting();
}

@UseGuards(JwtAuthGuard)
@Put('/setting')
async updateSetting( @Body() new_setting: Setting, @Req() req) : Promise<Setting>{
      if(req.user.is_admin){
            throw new HttpException('Staff or Admin only', HttpStatus.UNAUTHORIZED);
      }
      return await this.courtManagerService.update_setting(new_setting);
}

@UseGuards(JwtAuthGuard)
@Get('/setting')
async getSetting(@Req() req):Promise<Setting>{
      if(req.user.is_admin){
            throw new HttpException('Staff or Admin only', HttpStatus.UNAUTHORIZED);
      }
      return await this.courtManagerService.get_setting();
}

//get all list sport
@UseGuards(JwtAuthGuard)
@Get('/getAll')      
async getAllSportCourt(@Req() req) : Promise<List_Sport[]>{
      if(req.user.is_admin){
            throw new HttpException('Staff or Admin only', HttpStatus.UNAUTHORIZED);
      }
      return await this.courtManagerService.find_allSportList();
}

//Get sport by english name
@UseGuards(JwtAuthGuard)
@Get('/getSport')
async getSportList(@Body() id : {"id": string}, @Req() req) : Promise<List_Sport>{
      if(req.user.is_admin){
            throw new HttpException('Staff or Admin only', HttpStatus.UNAUTHORIZED);
      }
      return await this.courtManagerService.find_SportList_byID(id.id);
}

//create new document for each sport using body as List sport
@UseGuards(JwtAuthGuard)
@Post('/')    
async createSportList(@Body() court_data: List_Sport, @Req() req): Promise<List_Sport>{
      if(req.user.is_admin){
            throw new HttpException('Staff or Admin only', HttpStatus.UNAUTHORIZED);
      }
      return await this.courtManagerService.create_SportList(court_data);
}

//Param is sportType ex. Basketball (in english)
@UseGuards(JwtAuthGuard)
@Put('/court-setting/update')     
async changeCourtSetting( @Body() new_court: {"sport_id": string, "new_setting": [Court]}, @Req() req) : Promise<List_Sport>{
      if(req.user.is_admin){
            throw new HttpException('Staff or Admin only', HttpStatus.UNAUTHORIZED);
      }
     return await this.courtManagerService.update_CourtbyID(new_court.sport_id, new_court.new_setting);
}

}
