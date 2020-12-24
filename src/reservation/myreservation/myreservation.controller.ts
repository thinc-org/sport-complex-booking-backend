import { Controller ,UseGuards ,Post ,Get, Body, Param, Delete, Req, Patch } from '@nestjs/common';

import { Reservation } from "./../interfaces/reservation.interface";
import { MyReservationDto } from "./dto/myreservation.dto";

import { MyReservationService } from "./myreservation.service";
import { UserGuard, StaffGuard } from 'src/auth/jwt.guard'

@Controller('myreservation')
export class MyReservationController {
    constructor(private readonly myResrvationService : MyReservationService) {}
    
    @UseGuards(UserGuard)
    @Get('/getallreservation')
    async getAllReservation(@Req() req) : Promise<MyReservationDto[]> {
        return this.myResrvationService.getAllMyReservation(req.user.userId);
    } 

    @UseGuards(UserGuard)
    @Get('/getbyid/:id')
    async getById(@Param() param,@Req() req) : Promise<MyReservationDto> {
        return this.myResrvationService.getById(req.user.userId, param.id);
    }

    @UseGuards(UserGuard)
    @Delete('/cancel/:id')
    async cancelReservation(@Param() param,@Req() req) : Promise<Reservation> { 
        return this.myResrvationService.cancelMyReservation(req.user.userId,param.id);
    }

    @UseGuards(StaffGuard)
    @Patch('/check/:id')
    async checkReservation(@Param() param) : Promise<Reservation>{
        return this.myResrvationService.checkReservation(param.id);
    }

}
