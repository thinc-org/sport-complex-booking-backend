import { Injectable,HttpException, HttpStatus } from '@nestjs/common';
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types, isValidObjectId } from 'mongoose';

import { WaitingRoom, Reservation } from "./../interfaces/reservation.interface";
import { CreateWaitingRoomDto,CreateReservationDto } from "./dto/mywaitingroom.dto";
import { User } from "./../../users/interfaces/user.interface";

@Injectable()
export class MywaitingroomService {
    constructor(
        @InjectModel('WaitingRoom') private waitingRoomModel : Model<WaitingRoom>,
        @InjectModel('User') private userModel :  Model<User>,
        @InjectModel('Reservation') private reservationModel : Model<Reservation>
    ){}

    async createMyWaitingRoom( waitingRoom : WaitingRoom ) : Promise<WaitingRoom> {

        const newMyWaitingRoom = new this.waitingRoomModel(waitingRoom);

        return newMyWaitingRoom.save();
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

    async cancelMyWaitingRoom( myWaitingRoomID : Types.ObjectId ) : Promise<WaitingRoom>{
        let tempMyWaitingRoom : WaitingRoom = await this.waitingRoomModel.findByIdAndDelete(myWaitingRoomID);
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

        let temp = new CreateReservationDto();

        temp.list_member = tempMyWaitingRoom.list_member;
        temp.sport_id = tempMyWaitingRoom.sport_id;
        temp.court_number = tempMyWaitingRoom.court_number;
        temp.time_slot = tempMyWaitingRoom.time_slot;
        temp.is_check = false;
        temp.date = tempMyWaitingRoom.date;

        let newSuccesfulReservationModel = new this.reservationModel(temp);

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

    async excludeUser( myWaitingRoomID : Types.ObjectId , userID : Types.ObjectId) : Promise<WaitingRoom>{

        if (!isValidObjectId(myWaitingRoomID)) {
            throw new HttpException("Invalid MyWaitingRoomID", HttpStatus.BAD_REQUEST);
        }

        if (!isValidObjectId(userID)) {
            throw new HttpException("Invalid UserID", HttpStatus.BAD_REQUEST);
        }

        let tempWaitingRoom : WaitingRoom = await this.waitingRoomModel.findById(myWaitingRoomID);

        if(tempWaitingRoom === null){
            throw new HttpException("Invalid MyWaitingRoom", HttpStatus.NOT_FOUND);
        }
        
        const index : number = tempWaitingRoom.list_member.indexOf(userID);
        
        if( index === -1 ){
            throw new HttpException("Mywaitingroom doesn't exist the userID.", HttpStatus.BAD_REQUEST);
        }

        tempWaitingRoom.list_member.splice( index , 1 );
        tempWaitingRoom.save()

        return tempWaitingRoom;
    }
}
