import { Injectable,HttpException, HttpStatus } from '@nestjs/common';
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from 'mongoose';

import { Reservation } from "./../interfaces/reservation.interface";

import { User } from "./../../users/interfaces/user.interface";

import { CourtManagerService } from "./../../court-manager/court-manager.service";
import { UsersService } from "./../../users/users.service";
import { Setting } from "./../../court-manager/interfaces/setting.interface";


@Injectable()
export class MyReservationService {
    constructor(
        @InjectModel('User') private userModel :  Model<User>,
        @InjectModel('Reservation') private reservationModel : Model<Reservation>,
        private readonly courtManagerService : CourtManagerService,
        private readonly userService : UsersService
    ){}

    async getLanguage( user_id : Types.ObjectId) : Promise<boolean>{
        return (await this.userService.findById(user_id)).is_thai_language;
    }

    async getAllMyReservation( user_id : Types.ObjectId) : Promise<Reservation[]>{
        const reservation : Reservation[] = await this.reservationModel.find({list_member : user_id}).sort({sport_id : 1 , date : 1 , time_slot : -1, is_check : 1})
                                                                                .populate('sport_id','sport_name_th sport_name_en')
                                                                                .populate('list_member' ,'name_en surname_en name_th surname_th')
                                                                                .select('sport_id court_number date day_of_week time_slot is_check')
        return reservation;
    }

    async getById( userId : Types.ObjectId , reservationId : Types.ObjectId ) : Promise<Reservation>{

        var reservation : Reservation = await this.reservationModel.findById( reservationId )
            .populate('sport_id','sport_name_th sport_name_en')
            .populate('list_member' ,'name_en surname_en name_th surname_th');

        if( reservation === null ){
            throw new HttpException("This reservation doesn't exist.", HttpStatus.NOT_FOUND);
        }

        for(let user of reservation.toJSON().list_member ){
            if( user._id.toString() === userId.toString() ){
                return reservation;
            }
        }

        throw new HttpException("This userId isn't authorized.", HttpStatus.UNAUTHORIZED);
    } 

    async cancelMyReservation( user_id : Types.ObjectId , reservationId : Types.ObjectId ) : Promise<Reservation> { 

        const reservation : Reservation = await this.reservationModel.findById(reservationId);

        if( reservation === null ){
            throw new HttpException("This reservation doesn't exist.", HttpStatus.NOT_FOUND);
        }
        if( !reservation.list_member.includes(user_id) ){
            throw new HttpException("This user isn't in the reservation.", HttpStatus.UNAUTHORIZED);
        }

        reservation.remove();

        const date1 : Date = new Date(); 
        const date2 : Date = reservation.date; 
        const diffDate = (date2.getTime()-date1.getTime())/(1000 * 3600 * 24);

        const setting : Setting = await this.courtManagerService.getSetting();
        const late_cancelation_punishment : number = setting.late_cancelation_punishment,
            late_cancelation_day : number = setting.late_cancelation_day;

        if(0 <= diffDate && diffDate <= late_cancelation_day){
            for( let userid of reservation.list_member){
                let new_expired_penalize_date = new Date();
                new_expired_penalize_date.setDate(new_expired_penalize_date.getDate()+late_cancelation_punishment);
                await this.userModel.findByIdAndUpdate(userid,{is_penalize : true ,
                                                                expired_penalize_date : new_expired_penalize_date});
            }
        }

        return reservation;
    }

    async checkReservation( reservationId : Types.ObjectId ) : Promise<Reservation>{

        let reservation : Reservation = await this.reservationModel.findById(reservationId);

        if ( reservation === null ){
            throw new HttpException("Invalid reservation.", HttpStatus.NOT_FOUND)
        }

        reservation.is_check = true;
        reservation.save();
        return reservation;
    }

}
