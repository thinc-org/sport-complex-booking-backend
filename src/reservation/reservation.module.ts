import { Module } from '@nestjs/common';
import { MongooseModule} from "@nestjs/mongoose";

import { ReservationService } from './reservation.service';
import { ReservationController } from './reservation.controller';

import { ReservationSchema, WaitingRoomSchema } from "./schema/reservation.schema";
import { UsersService } from 'src/users/users.service';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports : [MongooseModule.forFeature(
    [{ name: 'WaitingRoom', schema: WaitingRoomSchema, collection: 'list_waiting_room'}]),
    MongooseModule.forFeature(
      [{ name: 'Reservation', schema: ReservationSchema, collection: 'list_reservation'}]),
    UsersModule,
  ],
  providers: [ReservationService],
  controllers: [ReservationController]
})
export class ReservationModule {}
