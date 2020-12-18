import { Controller ,UseGuards ,Post ,Get, Body, Param } from '@nestjs/common';
import { MywaitingroomService } from './mywaitingroom.service';
import { MyWaitingRoom } from "./interfaces/mywaitingroom.interface";
import { CreateMyWaitingRoomDto } from "./dto/mywaitingroom.dto";

@Controller('mywaitingroom')
export class MywaitingroomController {
    constructor( private readonly mywaitingroomService : MywaitingroomService ) {}

    //@UseGuards()
    @Post()
    async createMyWaitingRoom(@Body() createMyWaitingRoomDto : CreateMyWaitingRoomDto) : Promise<MyWaitingRoom> {
        return this.mywaitingroomService.createMyWaitingRoom(createMyWaitingRoomDto);
    }

    @Post('/:id')
    async addMyWaitingRoom(@Param() param){
        return this.mywaitingroomService.addMyWaitingRoom();
    }
}
