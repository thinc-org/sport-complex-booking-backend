import { Module } from '@nestjs/common';
import { MongooseModule, getModelToken } from "@nestjs/mongoose";

import { ReservationService } from './reservation.service';
import { ReservationController } from './reservation.controller';

import { ReservationSchema, WaitingRoomSchema } from "./schema/reservation.schema";

import { MywaitingroomModule } from "./mywaitingroom/mywaitingroom.module";
import { MyReservationModule } from "./myreservation/myreservation.module";

@Module({
  imports : [MongooseModule.forFeature(
    [{ name: 'WaitingRoom', schema: WaitingRoomSchema, collection: 'list_waiting_room'}]),
    MongooseModule.forFeature(
      [{ name: 'Reservation', schema: ReservationSchema, collection: 'list_reservation'}]),
    MywaitingroomModule,
    MyReservationModule
  ],
  providers: [ReservationService],
  controllers: [ReservationController],
})
export class ReservationModule {}
