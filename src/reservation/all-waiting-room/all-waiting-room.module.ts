import { Module } from '@nestjs/common';
import { AllWaitingRoomService } from './all-waiting-room.service';
import { AllWaitingRoomController } from './all-waiting-room.controller';
import { MongooseModule } from '@nestjs/mongoose';
import {WaitingRoomSchema} from 'src/reservation/schema/reservation.schema'
@Module({
  imports:[MongooseModule.forFeature([{ name: 'WaitingRoom', schema: WaitingRoomSchema, collection: 'list_waiting_room' }])],
  providers: [AllWaitingRoomService],
  controllers: [AllWaitingRoomController]
})
export class AllWaitingRoomModule {}
