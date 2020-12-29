import { Controller ,UseGuards ,Post ,Get, Body, Param, Delete, Req } from '@nestjs/common';
import { MywaitingroomService } from './mywaitingroom.service';
import { WaitingRoom, Reservation } from "./../interfaces/reservation.interface";
import { isValidObjectId, Types } from "mongoose";
import { HttpException, HttpStatus } from '@nestjs/common';
import { UserGuard } from 'src/auth/jwt.guard'

@UseGuards(UserGuard)

@Controller('mywaitingroom')
export class MywaitingroomController {
    constructor( private readonly mywaitingroomService : MywaitingroomService ) {}

    idValidityChecker( id : Types.ObjectId ){
        if (!isValidObjectId(id)) {
            throw new HttpException("Invalid ObjectId", HttpStatus.BAD_REQUEST);
        }
    }

    @Get('/id/:id')
    async getWaitingRoomById(@Param() param) : Promise<WaitingRoom>{
        this.idValidityChecker(param.id);
        return this.mywaitingroomService.getWaitingRoomById(param.id);
    }

    @Get('/expire/:id')
    async expireWaitingRoom(@Param() param) : Promise<Boolean>{
        this.idValidityChecker(param.id);
        return this.mywaitingroomService.expiredChecker(param.id);
    }

    @Delete('/exclude/:id/:userid')
    async excludeUser(@Param() param) : Promise<WaitingRoom>{
        this.idValidityChecker(param.id);
        this.idValidityChecker(param.userid);
        return this.mywaitingroomService.excludeUser( param.id , param.userid );
    }

    @Delete('/cancel/:id')
    async cancelWaitingRoom(@Param() param) : Promise<WaitingRoom>{
        this.idValidityChecker(param.id);
        return this.mywaitingroomService.cancelWaitingRoom(param.id);
    }

}
