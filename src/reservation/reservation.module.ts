import { Module } from "@nestjs/common"
import { MongooseModule } from "@nestjs/mongoose"

import { ReservationService } from "./reservation.service"
import { ReservationController } from "./reservation.controller"

import { ReservationSchema, WaitingRoomSchema } from "./schema/reservation.schema"
import { UsersModule } from "src/users/users.module"

import { MywaitingroomModule } from "./mywaitingroom/mywaitingroom.module"
import { MyReservationModule } from "./myreservation/myreservation.module"
import { CourtManagerModule } from "./../court-manager/court-manager.module"
import { DisableCourtsModule } from "./../courts/disable-courts/disable-courts.module"

@Module({
  imports: [
    MongooseModule.forFeature([{ name: "WaitingRoom", schema: WaitingRoomSchema, collection: "list_waiting_room" }]),
    MongooseModule.forFeature([{ name: "Reservation", schema: ReservationSchema, collection: "list_reservation" }]),
    MyReservationModule,
    UsersModule,
    MywaitingroomModule,
    DisableCourtsModule,
    CourtManagerModule,
    MyReservationModule,
  ],
  providers: [ReservationService],
  controllers: [ReservationController],
})
export class ReservationModule {}
