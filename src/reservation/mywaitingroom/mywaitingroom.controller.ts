import { Controller ,UseGuards ,Post ,Get, Body, Param, Delete } from '@nestjs/common';
import { MywaitingroomService } from './mywaitingroom.service';
import { MyWaitingRoom } from "./../interfaces/reservation.interface";
import { CreateMyWaitingRoomDto } from "./dto/mywaitingroom.dto";

@Controller('mywaitingroom')
export class MywaitingroomController {
    constructor( private readonly mywaitingroomService : MywaitingroomService ) {}

    //@UseGuards()
    @Post()
    async createMyWaitingRoom(@Body() myWaitingRoom : MyWaitingRoom) : Promise<MyWaitingRoom> {
        return this.mywaitingroomService.createMyWaitingRoom(myWaitingRoom);
    }

    @Post('/add/:user_id/:sport_id')
    async addMyWaitingRoom(@Param() param,@Body() createMyWaitingRoomDto : CreateMyWaitingRoomDto) : Promise<MyWaitingRoom>{
        return this.mywaitingroomService.addMyWaitingRoom(param.user_id,param.sport_id,createMyWaitingRoomDto);
    }

    @Post('/join/:user_id/:access_code')
    async joinUser(@Param() param) : Promise<MyWaitingRoom>{
        return this.mywaitingroomService.joinMember(param.user_id,param.access_code);
    } 

    @Delete('/:mywaitingroomid')
    async cancelMyWaitingRoom(@Param() param) : Promise<MyWaitingRoom>{
        return this.mywaitingroomService.cancelMyWaitingRoom(param.mywaitingroomid);
    }
}
