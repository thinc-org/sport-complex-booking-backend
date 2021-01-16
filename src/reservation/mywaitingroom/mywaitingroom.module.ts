import { Module, forwardRef } from "@nestjs/common"
import { MongooseModule } from "@nestjs/mongoose"

import { UsersModule } from "src/users/users.module"
import { MywaitingroomController } from "./mywaitingroom.controller"
import { MywaitingroomService } from "./mywaitingroom.service"
import { WaitingRoomSchema, ReservationSchema } from "./../schema/reservation.schema"

@Module({
  imports: [
    MongooseModule.forFeature([{ name: "Reservation", schema: ReservationSchema, collection: "list_reservation" }]),
    MongooseModule.forFeature([{ name: "WaitingRoom", schema: WaitingRoomSchema, collection: "list_waiting_room" }]),
    forwardRef(() => UsersModule),
  ],
  controllers: [MywaitingroomController],
  providers: [MywaitingroomService],
})
export class MywaitingroomModule {}
