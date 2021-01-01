import { Module } from '@nestjs/common';
import { AllWaitingRoomService } from './all-waiting-room.service';
import { AllWaitingRoomController } from './all-waiting-room.controller';
import { MongooseModule } from '@nestjs/mongoose';
import {WaitingRoomSchema} from 'src/reservation/schema/reservation.schema'
import { StaffsModule } from 'src/staffs/staffs.module';
@Module({
  imports:[MongooseModule.forFeature([{ name: 'WaitingRoom', schema: WaitingRoomSchema, collection: 'list_waiting_room' }]),StaffsModule],
  providers: [AllWaitingRoomService],
  controllers: [AllWaitingRoomController],
  exports: [AllWaitingRoomService]
})
export class AllWaitingRoomModule {}
