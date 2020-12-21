import { Injectable,HttpException, HttpStatus } from '@nestjs/common';
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from 'mongoose';

import { WaitingRoom, Reservation } from "./../interfaces/reservation.interface";
import { CreateWaitingRoomDto,CreateReservationDto } from "./dto/mywaitingroom.dto";
import { User } from "./../../users/interfaces/user.interface";

@Injectable()
export class MywaitingroomService {
    constructor(
        @InjectModel('MyWaitingRoom') private waitingRoomModel : Model<WaitingRoom>,
        @InjectModel('User') private userModel :  Model<User>,
        @InjectModel('SuccessfulReservation') private reservationModel : Model<Reservation>
    ){}

    async createMyWaitingRoom( waitingRoom : WaitingRoom ) : Promise<WaitingRoom> {

        const newMyWaitingRoom = new this.waitingRoomModel(waitingRoom);

        return newMyWaitingRoom.save();
    }

    async addMyWaitingRoom( user_Id : Types.ObjectId , 
                            sport_Id : Types.ObjectId ,
                            createMyWaitingRoomDto : CreateWaitingRoomDto ) : Promise<WaitingRoom> { 
                            // In the practicion use sport name to find the sport ID. 
        await this.checkUserCondition(user_Id);

        const newMyWaitingRoom = new this.waitingRoomModel(createMyWaitingRoomDto);

        newMyWaitingRoom.sport_id = sport_Id;
        newMyWaitingRoom.list_member.push(user_Id);
        newMyWaitingRoom.expired_date = (new Date());
        newMyWaitingRoom.expired_date.setDate(newMyWaitingRoom.expired_date.getDate() + 1);
        newMyWaitingRoom.access_code = await this.randomAccessCode(5);

        return newMyWaitingRoom.save();
    }

    async randomAccessCode( number : Number ) : Promise<String>{
        var temp : String = new String(), 
            temp2 : String = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
        while(true){
            for(let i =0;i<number;i++){
                temp+=temp2.charAt(Math.ceil(Math.random()*62));
            }
            var test_qeury : WaitingRoom[] = await this.waitingRoomModel.find({access_code : temp});
            if(test_qeury.length === 0 && temp.length == number){
                break;
            }
            temp = new String();
        }
        return temp; 
    }

    async checkUserCondition ( user_Id : Types.ObjectId ){
        const test_query : User = await this.userModel.findById(user_Id);

        if(test_query === null){
            throw new HttpException("This UserId doesn't exist.", HttpStatus.NOT_FOUND);
        }

        if(test_query.is_penalize === true){
            throw new HttpException("This user is penalize.", HttpStatus.BAD_REQUEST);
        }

        const test_query2 : WaitingRoom[] = await this.waitingRoomModel.find({list_member : user_Id});

        if(test_query2.length !== 0){
            throw new HttpException("This user is exist in a waiting room.", HttpStatus.BAD_REQUEST);
        }

    }

    async joinMember( user_Id : Types.ObjectId , acode : String ) : Promise<WaitingRoom>{

        await this.checkUserCondition(user_Id);

        var tempMyWaitingRoom : WaitingRoom[] = await this.waitingRoomModel.find({access_code : acode});

        if(tempMyWaitingRoom.length === 0){
            throw new HttpException("This access code doesn't belong to any MyWaitingRoom", HttpStatus.BAD_REQUEST);
        }

        tempMyWaitingRoom[0].list_member.push(user_Id);
        
        return tempMyWaitingRoom[0].save();
    } 

    async cancelMyWaitingRoom( myWaitingRoomID : Types.ObjectId ) : Promise<WaitingRoom>{
        var tempMyWaitingRoom : WaitingRoom = await this.waitingRoomModel.findByIdAndDelete(myWaitingRoomID);
        if(tempMyWaitingRoom === null){
            throw new HttpException("This my waiting room doesn't exist.", HttpStatus.BAD_REQUEST);
        }
        return tempMyWaitingRoom;
    }

    async acceptingMyWaitingRoom ( myWaitingRoomID : Types.ObjectId ) : Promise<Reservation>{
        const tempMyWaitingRoom : WaitingRoom  = await this.waitingRoomModel.findByIdAndDelete(myWaitingRoomID);

        if(tempMyWaitingRoom === null){
            throw new HttpException("This my waiting room doesn't exist.", HttpStatus.BAD_REQUEST);
        }

        var temp = new CreateReservationDto();

        temp.list_member = tempMyWaitingRoom.list_member;
        temp.sport_id = tempMyWaitingRoom.sport_id;
        temp.court_number = tempMyWaitingRoom.court_number;
        temp.time_slot = tempMyWaitingRoom.time_slot;
        temp.is_check = false;
        temp.date = tempMyWaitingRoom.date;

        var newSuccesfulReservationModel = new this.reservationModel(temp);

        return newSuccesfulReservationModel.save();
    }

    async expiredChecker( myWaitingRoomID : Types.ObjectId ) : Promise<Boolean>{
        const tempMyWaitingRoom : WaitingRoom  = await this.waitingRoomModel.findByIdAndDelete(myWaitingRoomID);
        if(new Date() > tempMyWaitingRoom.expired_date ){
            for( let user_id of tempMyWaitingRoom.list_member){
                const temp = await this.userModel.findByIdAndUpdate(user_id, {is_penalize : true});
            }
            return true;
        }
        return false;
    } 
}
