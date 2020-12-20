import { Module } from '@nestjs/common';
import { MongooseModule, getModelToken } from "@nestjs/mongoose";

import { ReservationService } from './reservation.service';
import { ReservationController } from './reservation.controller';

import { ReservationSchema, SuccesfulReservationSchema, MyWaitingRoomSchema } from "./schema/reservation.schema";

const myWaintingRoomProviderFactory = {
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

@Module({
  imports : [MongooseModule.forFeature([{
      name : 'Reservation',
      schema : ReservationSchema,
    }])
  ],
  providers: [ReservationService,
              myWaintingRoomProviderFactory,
              successfulReservationProviderFactory
            ],
  controllers: [ReservationController]
})
export class ReservationModule {}
