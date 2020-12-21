import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Reservation , WaitingRoom } from "./interfaces/reservation.interface";

@Injectable()
export class ReservationService {
    constructor(
        @InjectModel('WaitingRoom') private WaitingRoomModel : Model<WaitingRoom> ,
        @InjectModel('Reservation') private ReservationModel : Model<Reservation>
    ){}
    
    //Test na krub by NON
    async createWaitingRoom( WaitingRoom : WaitingRoom) : Promise<WaitingRoom>{
        const newMyWaitingRoom = new this.WaitingRoomModel(WaitingRoom);
        return newMyWaitingRoom.save();
    }

    //Test na krub by NON
    async createReservation( Reservation : Reservation) : Promise<Reservation>{
        const newSuccessfulReservation = new this.ReservationModel(Reservation);
        return newSuccessfulReservation.save();
    }

}
