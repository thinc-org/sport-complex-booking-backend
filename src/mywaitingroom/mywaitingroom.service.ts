import { Injectable } from '@nestjs/common';
import { InjectModel } from "@nestjs/mongoose";
import { promises } from 'dns';
import { Model, Types } from 'mongoose';
import { MyWaitingRoom } from "./interfaces/mywaitingroom.interface";

@Injectable()
export class MywaitingroomService {
    constructor(
        @InjectModel('MyWaitingRoom') private MyWaitingRoomModel : Model<MyWaitingRoom>
    ){}

    async createMyWaitingRoom( myWaitingRoom : MyWaitingRoom ) : Promise<MyWaitingRoom> {
        const newMyWaitingRoom = new this.MyWaitingRoomModel(myWaitingRoom)
        return newMyWaitingRoom.save();
    }

    async addMyWaitingRoom( _id : Types.ObjectId , ) : Promise<MyWaitingRoom> {



        return ;
    }
}
