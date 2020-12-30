import { Controller ,UseGuards ,Post ,Get, Body, Param, Delete, Req, Patch } from '@nestjs/common';

import { Reservation } from "./../interfaces/reservation.interface";

import { MyReservationService } from "./myreservation.service";
import { UserGuard, StaffGuard } from 'src/auth/jwt.guard'

import { isValidObjectId, Types } from "mongoose";
import { HttpException, HttpStatus } from '@nestjs/common';

@Controller('myreservation')
export class MyReservationController {
    constructor(private readonly myResrvationService : MyReservationService) {}

    idValidityChecker( id : Types.ObjectId ){
        if (!isValidObjectId(id)) {
            throw new HttpException("Invalid ObjectId", HttpStatus.BAD_REQUEST);
        }
    }
    
    @UseGuards(UserGuard)
    @Get()
    async getAllReservation(@Req() req) : Promise<Reservation[]> {
        this.idValidityChecker(req.user.userId);
        return this.myResrvationService.getAllMyReservation(req.user.userId);
    } 

    @UseGuards(UserGuard)
    @Get('/:id')
    async getById(@Param() param,@Req() req) : Promise<Reservation> {
        this.idValidityChecker(req.user.userId);
        this.idValidityChecker(param.id);
        return this.myResrvationService.getById(req.user.userId, param.id);
    }

    @UseGuards(UserGuard)
    @Delete('/:id')
    async cancelReservation(@Param() param,@Req() req) : Promise<Reservation> { 
        this.idValidityChecker(req.user.userId);
        this.idValidityChecker(param.id);
        return this.myResrvationService.cancelMyReservation(req.user.userId,param.id);
    }

    @UseGuards(StaffGuard)
    @Patch('/:id')
    async checkReservation(@Param() param) : Promise<Reservation>{
        this.idValidityChecker(param.id);
        return this.myResrvationService.checkReservation(param.id);
    }

}
