import { Module,forwardRef } from '@nestjs/common';
import { MongooseModule } from "@nestjs/mongoose";

import { UsersModule } from 'src/users/users.module';
import { ReservationModule } from "./../reservation.module";
import { MywaitingroomController } from "./mywaitingroom.controller";
import { MywaitingroomService } from "./mywaitingroom.service";
import { WaitingRoomSchema } from "./../schema/reservation.schema";

@Module({
    imports : [
        forwardRef(()=>ReservationModule),
        forwardRef(()=>UsersModule)
    ],
    controllers : [MywaitingroomController],
    providers : [MywaitingroomService],
    exports : [MywaitingroomService]
})
export class MywaitingroomModule {}
