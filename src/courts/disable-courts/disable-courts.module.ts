import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AllReservationModule } from 'src/reservation/all-reservation/all-reservation.module';
import { AllWaitingRoomModule } from 'src/reservation/all-waiting-room/all-waiting-room.module';
import { StaffsModule } from 'src/staffs/staffs.module';
import { DisableCourtsController } from './disable-courts.controller';
import { DisableCourtsService } from './disable-courts.service';
import { DisableCourtSchema } from './schemas/disable-courts.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: 'DisableCourt', schema: DisableCourtSchema}]), StaffsModule, AllReservationModule, AllWaitingRoomModule],
  controllers: [DisableCourtsController],
  providers: [DisableCourtsService],
  exports: [DisableCourtsService]
})
export class DisableCourtsModule {}
