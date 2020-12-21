import { Controller, Post, Body, UseGuards, Req, Res } from '@nestjs/common';

import { ReservationService } from "./reservation.service";

import { Reservation, WaitingRoom } from "./interfaces/reservation.interface";
import { JwtAuthGuard } from 'src/auth/jwt.guard';
import { WaitingRoomDto } from './dto/waiting-room.dto';


@Controller('reservation')
export class ReservationController {
    constructor(private readonly reservationService: ReservationService) { }

    //Test na krub by NON
    @Post('/waitingroom')
    async createMyWaitingRoom(@Body() WaitingRoom: WaitingRoom): Promise<WaitingRoom> {
        return this.reservationService.createTestWaitingRoom(WaitingRoom);
    }

    //Test na krub by NON
    @Post('/reservation')
    async createSuccessfulReservation(@Body() Reservation: Reservation): Promise<Reservation> {
        return this.reservationService.createReservation(Reservation);
    }

    @UseGuards(JwtAuthGuard)
    @Post('/checkvalidity')
    async checkValidity(@Req() req) {
        const valid = await this.reservationService.checkValidity(req.user.userId)
        return {message: "valid user"}
    }

    @UseGuards(JwtAuthGuard)
    @Post('/createwaitingroom')
    async createWaitingRoom(@Body() waitingroomdto: WaitingRoomDto,@Req() req): Promise<WaitingRoom>{
        const valid = await this.reservationService.checkValidity(req.user.userId)
        return await this.reservationService.createWaitingRoom(waitingroomdto,req.user.userId)
    }

    @UseGuards(JwtAuthGuard)
    @Post('/joinwaitingroom')
    async joinWaitingRoom(@Body() body: {"access_code": string},@Req() req){
        const valid = await this.reservationService.checkValidity(req.user.userId)
        return await this.reservationService.joinWaitingRoom(body.access_code,req.user.userId)
    }

    @UseGuards(JwtAuthGuard)
    @Post('/checkquota')
    async checkQuota(@Body() waitingroomdto: WaitingRoomDto,@Req() req){
        const valid = await this.reservationService.checkValidity(req.user.userId)    
        return await this.reservationService.checkQuota(waitingroomdto,req.user.userId)
    }

    @UseGuards(JwtAuthGuard)
    @Post('/checktimeslot')
    async checkTimeSlot(@Body() waitingroomdto: WaitingRoomDto,@Req() req){
        const valid = await this.reservationService.checkValidity(req.user.userId)    
        return await this.reservationService.checkTimeSlot(waitingroomdto)
    }
}
