import { Module,forwardRef } from '@nestjs/common';
import { MongooseModule } from "@nestjs/mongoose";

import { UsersModule } from 'src/users/users.module';
import { MywaitingroomController } from "./mywaitingroom.controller";
import { MywaitingroomService } from "./mywaitingroom.service";
import { MyWaitingRoomSchema } from "./schemas/mywaitingroom.schema";
import {  } from "module";

@Module({
    imports : [
        MongooseModule.forFeature([{ name : 'MyWaitingRoom', schema : MyWaitingRoomSchema , collection : "mywaitingroom" }]),
        forwardRef(()=>UsersModule)
    ],
    controllers : [MywaitingroomController],
    providers : [MywaitingroomService],
    exports : [MywaitingroomService]
})
export class MywaitingroomModule {}
