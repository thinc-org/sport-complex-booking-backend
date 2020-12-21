import { Controller ,UseGuards ,Post ,Get, Body, Param, Delete } from '@nestjs/common';
import { MywaitingroomService } from './mywaitingroom.service';
import { WaitingRoom, Reservation } from "./../interfaces/reservation.interface";
import { CreateWaitingRoomDto } from "./dto/mywaitingroom.dto";

@Controller('mywaitingroom')
export class MywaitingroomController {
    constructor( private readonly mywaitingroomService : MywaitingroomService ) {}

    // Delete
    @Post()
    async createMyWaitingRoom(@Body() waitingRoom : WaitingRoom) : Promise<WaitingRoom> {
        return this.mywaitingroomService.createMyWaitingRoom(waitingRoom);
    }

    //@UseGuards()
    @Post('/add/:user_id/:sport_id')
    async addMyWaitingRoom(@Param() param,@Body() createWaitingRoomDto : CreateWaitingRoomDto) : Promise<WaitingRoom>{
        return this.mywaitingroomService.addMyWaitingRoom(param.user_id,param.sport_id,createWaitingRoomDto);
    }

    @Post('/join/:user_id/:access_code')
    async joinUser(@Param() param) : Promise<WaitingRoom>{
        return this.mywaitingroomService.joinMember(param.user_id,param.access_code);
    } 

    @Delete('/:waitingroomid')
    async cancelMyWaitingRoom(@Param() param) : Promise<WaitingRoom>{
        return this.mywaitingroomService.cancelMyWaitingRoom(param.waitingroomid);
    }

    @Post('/accept/:waitingroomid')
    async aceptMyWaitingRoom(@Param() param) : Promise<Reservation> {
        return this.mywaitingroomService.acceptingMyWaitingRoom(param.waitingroomid);
    }

    @Get('/expire/:waitingroomid')
    async expireMyWaitingRoom(@Param() param) : Promise<Boolean>{
        return this.mywaitingroomService.expiredChecker(param.waitingroomid);
    }

}
