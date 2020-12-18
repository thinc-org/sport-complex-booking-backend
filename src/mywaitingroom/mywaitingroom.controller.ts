import { Controller ,UseGuards ,Post ,Get, Body, Param } from '@nestjs/common';
import { MywaitingroomService } from './mywaitingroom.service';
import { MyWaitingRoom } from "./interfaces/mywaitingroom.interface";
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
    async addMyWaitingRoom(@Param() param,@Body() createMyWaitingRoomDto : CreateMyWaitingRoomDto){
        return this.mywaitingroomService.addMyWaitingRoom(param.user_id,param.sport_id,createMyWaitingRoomDto);
    }
}
