import { Injectable,HttpException, HttpStatus } from '@nestjs/common';
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from 'mongoose';

import { WaitingRoom, Reservation } from "./../interfaces/reservation.interface";

import { User } from "./../../users/interfaces/user.interface";

@Injectable()
export class MyReservationService {
    constructor(
        @InjectModel('WaitingRoom') private waitingRoomModel : Model<WaitingRoom>,
        @InjectModel('User') private userModel :  Model<User>,
        @InjectModel('Reservation') private reservationModel : Model<Reservation>
    ){}

    //Change sport Id to sport name.
    async getAllMyReservation( user_id : Types.ObjectId ) : Promise<Reservation[]>{
        return await this.reservationModel.find({list_member : user_id}).sort({sport_id : 1 , date : 1 , time_slot : -1});
    }

    async getById( user_id : Types.ObjectId , reservation_id : Types.ObjectId ) : Promise<Reservation>{
        const test_qeury : Reservation = await this.reservationModel.findById(reservation_id);

        if( test_qeury === null ){
            throw new HttpException("This reservation doesn't exist.", HttpStatus.NOT_FOUND);
        }
        if( test_qeury.list_member.includes(user_id) ){
            throw new HttpException("This user isn't in the reservation.", HttpStatus.UNAUTHORIZED);
        }
        return test_qeury;
    } 

    async cancelMyReservation( user_id : Types.ObjectId , reservation_id : Types.ObjectId ) : Promise<Reservation> { 
        const test_qeury : Reservation = await this.reservationModel.findByIdAndDelete(reservation_id);

        if( test_qeury === null ){
            throw new HttpException("This reservation doesn't exist.", HttpStatus.NOT_FOUND);
        }
        if( !test_qeury.list_member.includes(user_id) ){
            throw new HttpException("This user isn't in the reservation.", HttpStatus.UNAUTHORIZED);
        }

        var date1 = new Date(); 
        var date2 = test_qeury.date; 
        var diffDate = (date2.getTime()-date1.getTime())/(1000 * 3600 * 24);

        // Get the expired_penalize_date from setting
        if(0 <= diffDate && diffDate <= 2){
            for( let userid of test_qeury.list_member){
                var new_expired_penalize_date = new Date();
                new_expired_penalize_date.setDate(new_expired_penalize_date.getDate()+14);
                await this.userModel.findByIdAndUpdate(userid,{is_penalize : true ,
                                                                expired_penalize_date : new_expired_penalize_date});
            }
        }

        return test_qeury;
    }

    //Delete 
    async unbanAll(){
        var users : User[] = await this.userModel.find({is_penalize : true});
        console.log(users);

        for(let user of users){
            console.log(user._id);
            await this.userModel.findByIdAndUpdate(user._id,{is_penalize : false},{useFindAndModify: false,new: true});
        }

    }
}
