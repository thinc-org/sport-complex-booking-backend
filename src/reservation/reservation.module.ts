import { Module } from '@nestjs/common';
import { MongooseModule, getModelToken } from "@nestjs/mongoose";

import { ReservationService } from './reservation.service';
import { ReservationController } from './reservation.controller';

import { ReservationSchema, WaitingRoomSchema } from "./schema/reservation.schema";

/*const myWaintingRoomProviderFactory = {
  provide: getModelToken('MyWaitingRoom'),
  useFactory: (reservationModel) =>
  reservationModel.discriminator('MyWaitingRoom', MyWaitingRoomSchema),
  inject: [getModelToken('Reservation')]
}

const successfulReservationProviderFactory = {
  provide: getModelToken('SuccessfulReservation'),
  useFactory: (reservationModel) =>
  reservationModel.discriminator('SuccessfulReservation', SuccesfulReservationSchema),
  inject: [getModelToken('Reservation')]
}
*/

@Module({
  imports : [MongooseModule.forFeature(
    [{ name: 'WaitingRoom', schema: WaitingRoomSchema, collection: 'list_waiting_room'}]),
    MongooseModule.forFeature(
      [{ name: 'Reservation', schema: ReservationSchema, collection: 'list_reservation'}])
  ],
  providers: [ReservationService],
  controllers: [ReservationController]
})
export class ReservationModule {}
