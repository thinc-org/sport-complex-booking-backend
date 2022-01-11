import { forwardRef, HttpModule, Module } from "@nestjs/common"
import { getModelToken, MongooseModule } from "@nestjs/mongoose"
import { CuStudentSchema, OtherSchema, SatitCuPersonelSchema, UserSchema } from "./schemas/users.schema"
import { UsersController } from "./users.controller"
import { UsersService } from "./users.service"
import { AuthModule } from "src/auth/auth.module"

import { SsoContentSchema } from "./schemas/sso.schema"
import { ConfigModule } from "@nestjs/config"
import { FSModule } from "src/fs/fs.module"
import { ReservationSchema, WaitingRoomSchema } from "src/reservation/schema/reservation.schema"

const cuStudentProviderFactory = {
  provide: getModelToken("CuStudent"),
  useFactory: (userModel) => userModel.discriminator("CuStudent", CuStudentSchema),
  inject: [getModelToken("User")],
}

const satitCuPersonelProviderFactory = {
  provide: getModelToken("SatitCuPersonel"),
  useFactory: (userModel) => userModel.discriminator("SatitAndCuPersonel", SatitCuPersonelSchema),
  inject: [getModelToken("User")],
}

const OtherProviderFactory = {
  provide: getModelToken("Other"),
  useFactory: (userModel) => userModel.discriminator("Other", OtherSchema),
  inject: [getModelToken("User")],
}

@Module({
  imports: [
    ConfigModule,
    forwardRef(() => AuthModule),
    forwardRef(() => FSModule),
    MongooseModule.forFeature([{ name: "User", schema: UserSchema, collection: "users" }]),
    MongooseModule.forFeature([{ name: "SsoContent", schema: SsoContentSchema }]),
    MongooseModule.forFeature([{ name: "WaitingRoom", schema: WaitingRoomSchema, collection: "list_waiting_room" }]),
    MongooseModule.forFeature([{ name: "Reservation", schema: ReservationSchema, collection: "list_reservation" }]),
    HttpModule,
  ],
  controllers: [UsersController],
  providers: [cuStudentProviderFactory, satitCuPersonelProviderFactory, OtherProviderFactory, UsersService],
  exports: [
    MongooseModule.forFeature([{ name: "User", schema: UserSchema, collection: "users" }]),
    MongooseModule.forFeature([{ name: "SsoContent", schema: SsoContentSchema }]),
    cuStudentProviderFactory,
    satitCuPersonelProviderFactory,
    OtherProviderFactory,
    UsersService,
  ],
})
export class UsersModule {}
