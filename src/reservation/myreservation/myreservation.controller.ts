import { Controller ,UseGuards ,Post ,Get, Body, Param, Delete, Req } from '@nestjs/common';

import { Reservation } from "./../interfaces/reservation.interface";
import { MyReservationDto } from "./dto/myreservation.dto";

import { MyReservationService } from "./myreservation.service";
import { JwtAuthGuard } from 'src/auth/jwt.guard'

@Controller('myreservation')
export class MyReservationController {
    constructor(private readonly myResrvationService : MyReservationService) {}
    
    @UseGuards(JwtAuthGuard)
    @Get('/getallreservation')
    async getAllReservation(@Req() req) : Promise<MyReservationDto[]> {
        return this.myResrvationService.getAllMyReservation(req.user.userId); // Not sure that JWT that contain is_thai_language
    } 

    @UseGuards(JwtAuthGuard)
    @Get('/getbyid/:id')
    async getById(@Param() param,@Req() req) : Promise<MyReservationDto> {
        return this.myResrvationService.getById(req.user.userId, param.id);
    }

    @UseGuards(JwtAuthGuard)
    @Delete('/cancel/:id')
    async cancelReservation(@Param() param,@Req() req) : Promise<Reservation> { 
        return this.myResrvationService.cancelMyReservation(req.user.userId,param.id);
    }

    @Get('/unbanall')
    async unbanAll(){
        this.myResrvationService.unbanAll();
    }
}
