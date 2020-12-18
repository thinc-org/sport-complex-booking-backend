import { Module } from '@nestjs/common';
import { Mongoose } from 'mongoose';
import { MongooseModule } from "@nestjs/mongoose";
import { MywaitingroomController } from "./mywaitingroom.controller";
import { MywaitingroomService } from "./mywaitingroom.service";
import { MyWaitingRoomSchema } from "./schemas/mywaitingroom.schema";

@Module({
    imports : [
        MongooseModule.forFeature([{ name : 'MyWaitingRoom', schema : MyWaitingRoomSchema , collection : "mywaitingroom" }])
    ],
    controllers : [MywaitingroomController],
    providers : [MywaitingroomService],
    exports : [MywaitingroomService]
})
export class MywaitingroomModule {}
