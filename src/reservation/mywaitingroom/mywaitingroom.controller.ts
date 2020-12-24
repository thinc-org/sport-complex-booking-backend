import { Controller ,UseGuards ,Post ,Get, Body, Param, Delete, Req } from '@nestjs/common';
import { MywaitingroomService } from './mywaitingroom.service';
import { WaitingRoom, Reservation } from "./../interfaces/reservation.interface";
import { CreateWaitingRoomDto } from "./dto/mywaitingroom.dto";
import { UserGuard } from 'src/auth/jwt.guard'

@UseGuards(UserGuard)

@Controller('mywaitingroom')
export class MywaitingroomController {
    constructor( private readonly mywaitingroomService : MywaitingroomService ) {}

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

    @Delete('/exclude/:waitingroomid/:userid')
    async excludeUser(@Param() param) : Promise<WaitingRoom>{
        return this.mywaitingroomService.excludeUser( param.waitingroomid , param.userid );
    }

}
