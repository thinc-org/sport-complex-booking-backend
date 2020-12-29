import { Injectable,HttpException, HttpStatus } from '@nestjs/common';
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from 'mongoose';

import { WaitingRoom, Reservation } from "./../interfaces/reservation.interface";
import { CreateReservationDto } from "./dto/mywaitingroom.dto";
import { User } from "./../../users/interfaces/user.interface";

@Injectable()
export class MywaitingroomService {
    constructor(
        @InjectModel('WaitingRoom') private waitingRoomModel : Model<WaitingRoom>,
        @InjectModel('User') private userModel :  Model<User>,
        @InjectModel('Reservation') private reservationModel : Model<Reservation>
    ){}

    async createWaitingRoom( waitingRoom : WaitingRoom ) : Promise<WaitingRoom> {

        const newMyWaitingRoom = new this.waitingRoomModel(waitingRoom);

        return newMyWaitingRoom.save();
    }

    async checkUserCondition ( userId : Types.ObjectId ){

        const test_query : User = await this.userModel.findById(userId);

        if(test_query === null){
            throw new HttpException("This userId doesn't exist.", HttpStatus.NOT_FOUND);
        }

        if(test_query.is_penalize === true){
            throw new HttpException("This user is penalize.", HttpStatus.BAD_REQUEST);
        }

        const test_query2 : WaitingRoom[] = await this.waitingRoomModel.find({list_member : userId});

        if(test_query2.length !== 0){
            throw new HttpException("This user is exist in a waiting room.", HttpStatus.BAD_REQUEST);
        }

    }

    async cancelWaitingRoom( myWaitingRoomID : Types.ObjectId ) : Promise<WaitingRoom>{
        let tempMyWaitingRoom : WaitingRoom = await this.waitingRoomModel.findByIdAndDelete(myWaitingRoomID);
        if(tempMyWaitingRoom === null){
            throw new HttpException("This my waiting room doesn't exist.", HttpStatus.BAD_REQUEST);
        }
        return tempMyWaitingRoom;
    }

    async expiredChecker( myWaitingRoomID : Types.ObjectId ) : Promise<Boolean>{
        const tempMyWaitingRoom : WaitingRoom  = await this.waitingRoomModel.findByIdAndDelete(myWaitingRoomID);
        if(new Date() > tempMyWaitingRoom.expired_date ){
            for( let userId of tempMyWaitingRoom.list_member){
                const temp = await this.userModel.findByIdAndUpdate(userId, {is_penalize : true});
            }
            return true;
        }
        return false;
    } 

    async excludeUser( myWaitingRoomID : Types.ObjectId , userId : Types.ObjectId) : Promise<WaitingRoom>{

        let tempWaitingRoom : WaitingRoom = await this.waitingRoomModel.findById(myWaitingRoomID);

        if(tempWaitingRoom === null){
            throw new HttpException("Invalid MyWaitingRoom", HttpStatus.NOT_FOUND);
        }
        
        const index : number = tempWaitingRoom.list_member.indexOf(userId);
        
        if( index === -1 ){
            throw new HttpException("Mywaitingroom doesn't exist the userId.", HttpStatus.BAD_REQUEST);
        }

        tempWaitingRoom.list_member.splice( index , 1 );
        tempWaitingRoom.save()

        return tempWaitingRoom;
    }

    async getWaitingRoomById( userId : Types.ObjectId) : Promise<WaitingRoom>{

        let tempWaitingRoom : WaitingRoom = await this.waitingRoomModel.find({list_member : userId})[0];

        return tempWaitingRoom;
    }
}
