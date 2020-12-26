import { Module } from '@nestjs/common';
import { AllReservationService } from './all-reservation.service';
import { AllReservationController } from './all-reservation.controller';
import { MongooseModule } from '@nestjs/mongoose';
import {ReservationSchema} from 'src/reservation/schema/reservation.schema'
@Module({
  imports:[MongooseModule.forFeature([{ name: 'AllReservation', schema: ReservationSchema, collection: 'list_reservation' }])],
  providers: [AllReservationService],
  controllers: [AllReservationController]
})
export class AllReservationModule {}
