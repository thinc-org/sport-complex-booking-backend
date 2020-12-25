import { Module } from '@nestjs/common';
import { MongooseModule} from "@nestjs/mongoose";

import { ReservationService } from './reservation.service';
import { ReservationController } from './reservation.controller';

import { ReservationSchema, WaitingRoomSchema } from "./schema/reservation.schema";
import { UsersModule } from 'src/users/users.module';
import { DisableCourtsService } from 'src/courts/disable-courts/disable-courts.service';

@Module({
  imports : [MongooseModule.forFeature(
    [{ name: 'WaitingRoom', schema: WaitingRoomSchema, collection: 'list_waiting_room'}]),
    MongooseModule.forFeature(
      [{ name: 'Reservation', schema: ReservationSchema, collection: 'list_reservation'}]),
    UsersModule,
    DisableCourtsService
  ],
  providers: [ReservationService],
  controllers: [ReservationController]
})
export class ReservationModule {}
