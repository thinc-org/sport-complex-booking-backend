import { Injectable,HttpException, HttpStatus } from '@nestjs/common';
import { InjectModel } from "@nestjs/mongoose";
import { Model, isValidObjectId, Types } from 'mongoose';

import { Reservation } from "./../interfaces/reservation.interface";

import { User } from "./../../users/interfaces/user.interface";
import { MyReservationDto, firstClass , secondClass } from "./dto/myreservation.dto";
import { List_Sport } from "./../../court-manager/interfaces/sportCourt.interface";

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

    async reservationToDtoFirst( myreservation : Reservation , is_thai_language : boolean ) :  Promise<firstClass>{
        let temp : firstClass = new firstClass();

        const sport : List_Sport = await this.courtManagerService.find_SportList_byID(myreservation.sport_id.toString());

        temp.my_reservation_id = myreservation._id;
        
        if(is_thai_language){
            temp.sport_name = sport.sport_name_th;
        }
        else{
            temp.sport_name = sport.sport_name_en;
        }

        temp.court_num = myreservation.court_number;
        temp.time_slot = myreservation.time_slot;
        temp.date = myreservation.date;

        return temp;
    }

    async reservationToDtoSecond( myreservation : Reservation , is_thai_language : boolean ) :  Promise<secondClass>{
        let temp : secondClass = new secondClass();

        temp.list_member_id = myreservation.list_member;

        let user_name : String[] = new Array();

        for (let user_id of temp.list_member_id ){
            let user = await this.userService.findById(user_id);
            if(is_thai_language)
            {
                user_name.push(user.name_th);
            }
            else{
                user_name.push(user.name_en);
            }
        }

        temp.list_member_name = user_name;
        
        return temp;
    }

    async getLanguage( user_id : Types.ObjectId) : Promise<boolean>{
        return (await this.userService.findById(user_id)).is_thai_language;
    }

    async getAllMyReservation( user_id : Types.ObjectId) : Promise<MyReservationDto[]>{

        const temp_myreservations : Reservation[] = await this.reservationModel.find({list_member : user_id}).sort({sport_id : 1 , date : 1 , time_slot : -1});
        let output : MyReservationDto[] = new  Array(temp_myreservations.length);
        const is_thai_language = await this.getLanguage(user_id);

        for ( let i in temp_myreservations ){
            output[i] = new MyReservationDto();
            output[i].first = await this.reservationToDtoFirst(temp_myreservations[i],is_thai_language);
        }

        return output;
    }

    async getById( user_id : Types.ObjectId , reservation_id : Types.ObjectId ) : Promise<MyReservationDto>{
        const test_qeury : Reservation = await this.reservationModel.findById(reservation_id);
        const is_thai_language = await this.getLanguage(user_id);

        if( test_qeury === null ){
            throw new HttpException("This reservation doesn't exist.", HttpStatus.NOT_FOUND);
        }
        if( test_qeury.list_member.includes(user_id) ){
            throw new HttpException("This user isn't in the reservation.", HttpStatus.UNAUTHORIZED);
        }

        let temp : MyReservationDto = new MyReservationDto();
        temp.first = await this.reservationToDtoFirst(test_qeury,is_thai_language);
        temp.second = await this.reservationToDtoSecond(test_qeury,is_thai_language);

        return temp;
    } 

    async cancelMyReservation( user_id : Types.ObjectId , reservation_id : Types.ObjectId ) : Promise<Reservation> { 

        if (!isValidObjectId(reservation_id)) {
            throw new HttpException("Invalid ObjectId", HttpStatus.BAD_REQUEST)
        }
        if (!isValidObjectId(user_id)) {
            throw new HttpException("Invalid ObjectId", HttpStatus.BAD_REQUEST)
        }

        const test_qeury : Reservation = await this.reservationModel.findById(reservation_id);

        if( test_qeury === null ){
            throw new HttpException("This reservation doesn't exist.", HttpStatus.NOT_FOUND);
        }
        if( !test_qeury.list_member.includes(user_id) ){
            throw new HttpException("This user isn't in the reservation.", HttpStatus.UNAUTHORIZED);
        }

        test_qeury.remove();

        const date1 : Date = new Date(); 
        const date2 : Date = test_qeury.date; 
        const diffDate = (date2.getTime()-date1.getTime())/(1000 * 3600 * 24);

        const setting : Setting = await this.courtManagerService.get_setting();
        const late_cancelation_punishment : number = setting.late_cancelation_punishment,
            late_cancelation_day : number = setting.late_cancelation_day;

        if(0 <= diffDate && diffDate <= late_cancelation_day){
            for( let userid of test_qeury.list_member){
                let new_expired_penalize_date = new Date();
                new_expired_penalize_date.setDate(new_expired_penalize_date.getDate()+late_cancelation_punishment);
                await this.userModel.findByIdAndUpdate(userid,{is_penalize : true ,
                                                                expired_penalize_date : new_expired_penalize_date});
            }
        }

        return test_qeury;
    }

    async checkReservation( reservation_id : Types.ObjectId ) : Promise<Reservation>{
        
        if (!isValidObjectId(reservation_id)) {
            throw new HttpException("Invalid ObjectId", HttpStatus.BAD_REQUEST);
        }

        let temp : Reservation = await this.reservationModel.findById(reservation_id);

        if ( temp === null ){
            throw new HttpException("Invalid reservation.", HttpStatus.NOT_FOUND)
        }

        temp.is_check = true;
        temp.save();
        return temp;
    }

}
