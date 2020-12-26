import { Controller, Post, Body, UseGuards, Req, Res } from '@nestjs/common';

import { ReservationService } from "./reservation.service";

import { Reservation, WaitingRoom } from "./interfaces/reservation.interface";
import { JwtAuthGuard } from 'src/auth/jwt.guard';
import { WaitingRoomDto } from './dto/waiting-room.dto';
import { JoinWaitingRoomDto } from './dto/join-waiting-room.dto';


@Controller('reservation')
export class ReservationController {
    constructor(private readonly reservationService: ReservationService) { }

    @UseGuards(JwtAuthGuard)
    @Post('/checkvalidity')
    async checkValidity(@Req() req) {
        await this.reservationService.checkValidity(req.user.userId)
        return {message: "valid user"}
    }

    @UseGuards(JwtAuthGuard)
    @Post('/createwaitingroom')
    async createWaitingRoom(@Body() waitingRoomDto: WaitingRoomDto,@Req() req): Promise<WaitingRoom>{
        await this.reservationService.checkValidity(req.user.userId)
        return await this.reservationService.createWaitingRoom(waitingRoomDto,req.user.userId)
    }

    @UseGuards(JwtAuthGuard)
    @Post('/joinwaitingroom')
    async joinWaitingRoom(@Body() joinWaitingRoomDto: JoinWaitingRoomDto,@Req() req){
        await this.reservationService.checkValidity(req.user.userId)
        return await this.reservationService.joinWaitingRoom(joinWaitingRoomDto.access_code,req.user.userId)
    }

    @UseGuards(JwtAuthGuard)
    @Post('/checkquota')
    async checkQuota(@Body() waitingRoomDto: WaitingRoomDto,@Req() req){
        await this.reservationService.checkValidity(req.user.userId)    
        return await this.reservationService.checkQuota(waitingRoomDto,req.user.userId)
    }

    @UseGuards(JwtAuthGuard)
    @Post('/checktimeslot')
    async checkTimeSlot(@Body() waitingRoomDto: WaitingRoomDto,@Req() req){
        await this.reservationService.checkValidity(req.user.userId)    
        return await this.reservationService.checkTimeSlot(waitingRoomDto)
    }
}
