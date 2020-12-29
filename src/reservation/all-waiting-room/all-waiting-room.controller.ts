import { Controller, Get ,Param,Body,UseGuards, Delete,Post} from '@nestjs/common';
import { AllWaitingRoomService } from './all-waiting-room.service';
import {StaffGuard } from 'src/auth/jwt.guard'

@UseGuards(StaffGuard)  
@Controller('all-waiting-room')
export class AllWaitingRoomController {
    constructor (private readonly allWaitingRoomService:AllWaitingRoomService) {}

    @Post()
    getSearchResult(@Body() body){
        return this.allWaitingRoomService.getWaitingRoomSearchResult(body);
    }
  
    @Get("/:id")
    getWaitingRoom(@Param('id') id:string){
        return this.allWaitingRoomService.getWaitingRoom(id);
    }

    @Delete("/:id")
    delete(@Param('id') id:string){
        return this.allWaitingRoomService.deleteWaitingRoom(id);
    }
}
