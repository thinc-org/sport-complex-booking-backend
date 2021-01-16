import { Module } from "@nestjs/common"
import { AllReservationService } from "./all-reservation.service"
import { AllReservationController } from "./all-reservation.controller"
import { MongooseModule } from "@nestjs/mongoose"
import { ReservationSchema } from "src/reservation/schema/reservation.schema"
import { StaffsModule } from "src/staffs/staffs.module"
import { UsersModule } from "src/users/users.module"
@Module({
  imports: [
    MongooseModule.forFeature([{ name: "Reservation", schema: ReservationSchema, collection: "list_reservation" }]),
    StaffsModule,
    UsersModule,
  ],
  providers: [AllReservationService],
  controllers: [AllReservationController],
  exports: [AllReservationService],
})
export class AllReservationModule {}
