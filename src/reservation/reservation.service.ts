import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { SuccessfulReservation , MyWaitingRoom } from "./interfaces/reservation.interface";

@Injectable()
export class ReservationService {
    constructor(
        @InjectModel('MyWaitingRoom') private myWaitingRoomModel : Model<MyWaitingRoom> ,
        @InjectModel('SuccessfulReservation') private succesfullReservationModel : Model<SuccessfulReservation>
    ){}
    
    //Test na krub by NON
    async createMyWaitingRoom( myWaitingRoom : MyWaitingRoom) : Promise<MyWaitingRoom>{
        const newMyWaitingRoom = new this.myWaitingRoomModel(myWaitingRoom);
        return newMyWaitingRoom.save();
    }

    //Test na krub by NON
    async createSuccessfulReservation( succesfulReservation : SuccessfulReservation) : Promise<SuccessfulReservation>{
        const newSuccessfulReservation = new this.succesfullReservationModel(succesfulReservation);
        return newSuccessfulReservation.save();
    }

}
