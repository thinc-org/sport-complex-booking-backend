import { Injectable,HttpException, HttpStatus } from '@nestjs/common';
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from 'mongoose';

import { MyWaitingRoom } from "./interfaces/mywaitingroom.interface";
import { CreateMyWaitingRoomDto } from "./dto/mywaitingroom.dto";
import { User } from "./../users/interfaces/user.interface";

@Injectable()
export class MywaitingroomService {
    constructor(
        @InjectModel('MyWaitingRoom') private myWaitingRoomModel : Model<MyWaitingRoom>,
        @InjectModel('User') private userModel :  Model<User>
    ){}

    async createMyWaitingRoom( myWaitingRoom : MyWaitingRoom ) : Promise<MyWaitingRoom> {

        const newMyWaitingRoom = new this.myWaitingRoomModel(myWaitingRoom);

        return newMyWaitingRoom.save();
    }

    async addMyWaitingRoom( user_Id : Types.ObjectId , 
                            sport_Id : Types.ObjectId ,
                            createMyWaitingRoomDto : CreateMyWaitingRoomDto ) : Promise<MyWaitingRoom> { 
                            // In the practicion use sport name to find the sport ID. 
        const test_query : User = await this.userModel.findById(user_Id);

        if(test_query == null){
            throw new HttpException("There isn't this user ID.", HttpStatus.NOT_FOUND);
        }

        if(test_query.is_penalize === true){
            throw new HttpException("This user is penalize.", HttpStatus.BAD_REQUEST);
        }

        const test_query2 : MyWaitingRoom[] = await this.myWaitingRoomModel.find({list_member : user_Id});

        console.log(test_query2);

        if(test_query2.length !== 0){
            throw new HttpException("This user is exist in a waiting room.", HttpStatus.BAD_REQUEST);
        }

        const newMyWaitingRoom = new this.myWaitingRoomModel(createMyWaitingRoomDto);

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
            var test_qeury : MyWaitingRoom[] = await this.myWaitingRoomModel.find({access_code : temp});
            if(test_qeury.length === 0 && temp.length == number){
                break;
            }
            temp = new String();
        }
        return temp; 
    }
}
