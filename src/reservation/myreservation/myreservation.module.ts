import { Module, forwardRef } from "@nestjs/common"
import { MongooseModule } from "@nestjs/mongoose"

import { UsersModule } from "src/users/users.module"
import { MyReservationController } from "./myreservation.controller"

import { MyReservationService } from "./myreservation.service"

import { StaffsModule } from "./../../staffs/staffs.module"
import { CourtManagerModule } from "./../../court-manager/court-manager.module"

import { WaitingRoomSchema, ReservationSchema } from "./../schema/reservation.schema"

@Module({
  imports: [
    MongooseModule.forFeature([{ name: "Reservation", schema: ReservationSchema, collection: "list_reservation" }]),
    MongooseModule.forFeature([{ name: "WaitingRoom", schema: WaitingRoomSchema, collection: "list_waiting_room" }]),
    forwardRef(() => UsersModule),
    forwardRef(() => StaffsModule),
    CourtManagerModule,
  ],
  controllers: [MyReservationController],
  providers: [MyReservationService],
})
export class MyReservationModule {}
