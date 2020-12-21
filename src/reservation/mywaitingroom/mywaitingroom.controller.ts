import { Controller ,UseGuards ,Post ,Get, Body, Param, Delete, Req } from '@nestjs/common';
import { MywaitingroomService } from './mywaitingroom.service';
import { WaitingRoom, Reservation } from "./../interfaces/reservation.interface";
import { CreateWaitingRoomDto } from "./dto/mywaitingroom.dto";
import { JwtAuthGuard } from 'src/auth/jwt.guard'

@Controller('mywaitingroom')
export class MywaitingroomController {
    constructor( private readonly mywaitingroomService : MywaitingroomService ) {}

    // Delete
    @Post()
    async createMyWaitingRoom(@Body() waitingRoom : WaitingRoom) : Promise<WaitingRoom> {
        return this.mywaitingroomService.createMyWaitingRoom(waitingRoom);
    }

    @UseGuards(JwtAuthGuard)
    @Post('/add/:sport_id')
    async addMyWaitingRoom(@Param() param,
                            @Body() createWaitingRoomDto : CreateWaitingRoomDto,
                            @Req() req) : Promise<WaitingRoom>{
        console.log(req.user.userId);
        return this.mywaitingroomService.addMyWaitingRoom(req.user.userId,param.sport_id,createWaitingRoomDto);
    }

    @UseGuards(JwtAuthGuard)
    @Post('/join/:access_code')
    async joinUser(@Param() param, @Req() req) : Promise<WaitingRoom>{
        return this.mywaitingroomService.joinMember(req.user.userId,param.access_code);
    } 

    @UseGuards(JwtAuthGuard)
    @Delete('/:waitingroomid')
    async cancelMyWaitingRoom(@Param() param) : Promise<WaitingRoom>{
        return this.mywaitingroomService.cancelMyWaitingRoom(param.waitingroomid);
    }

    @UseGuards(JwtAuthGuard)
    @Post('/accept/:waitingroomid')
    async aceptMyWaitingRoom(@Param() param) : Promise<Reservation> {
        return this.mywaitingroomService.acceptingMyWaitingRoom(param.waitingroomid);
    }

    @UseGuards(JwtAuthGuard)
    @Get('/expire/:waitingroomid')
    async expireMyWaitingRoom(@Param() param) : Promise<Boolean>{
        return this.mywaitingroomService.expiredChecker(param.waitingroomid);
    }

}
