import { Injectable ,HttpException,HttpStatus} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model} from 'mongoose';
import {WaitingRoom} from 'src/reservation/interfaces/reservation.interface'
import { DisableCourt } from 'src/courts/disable-courts/interfaces/disable-courts.interface';

@Injectable()
export class AllWaitingRoomService {
    constructor(@InjectModel("WaitingRoom") private readonly waitingRoomModel:Model<WaitingRoom>){}

  async getWaitingRoom(id:string) : Promise<WaitingRoom> {
  
    const waitingRoom=await this.waitingRoomModel.findById(id).exec();
    
    if(!waitingRoom)
      throw new HttpException('Waiting room not found', HttpStatus.NOT_FOUND);
    return waitingRoom;
  }

  async getWaitingRoomSearchResult(sportId:string,courtNumber:number,date:Date,timeSlot:number[],start:number,end:number) : Promise<[Number,WaitingRoom[]]> {

    let waitingRoom= this.waitingRoomModel.find();

    if(sportId !==undefined)
    {
      waitingRoom=waitingRoom.find({"sport_id":sportId});
      if(courtNumber !==undefined) waitingRoom=waitingRoom.find({"court_number":courtNumber});
    }

    if(date!==undefined)
    { 
      date=new Date(date);
      let nextDate=new Date(date);
      nextDate.setDate(date.getDate()+1);
      waitingRoom=waitingRoom.find({"date":{$gte:date,$lt:nextDate}});
   }

    if(timeSlot!==undefined)
      waitingRoom=waitingRoom.find({"time_slot":{$elemMatch:{$in:timeSlot}}});
    
    let result:WaitingRoom[]=await waitingRoom;
    const length=result.length;
    
    if(start !== undefined){

      start=Number(start);
      if(end === undefined)
          result = result.slice(start);
      else {
          end=Number(end);
          result = result.slice(start,end);
      }
    }
    
    return [length,result];
  
  }
  async deleteWaitingRoom(id:string) : Promise<WaitingRoom>
  {
    const waitingRoom=this.waitingRoomModel.findByIdAndRemove(id);

    if(!waitingRoom)
      throw new HttpException('Waiting room not found', HttpStatus.NOT_FOUND);
    return waitingRoom;
  }

  async findOverlapWaitingroom(disableCourt:DisableCourt) :Promise<WaitingRoom[]>
  {
    let queryArray=[];
    for(const distime of disableCourt.disable_time)
    {
      queryArray.push({time_slot:{$elemMatch:{$in:distime.time_slot}},day:distime.day});
    }
    const waitingRoom=await this.waitingRoomModel.find({date:{$gte:disableCourt.starting_date,$lt:disableCourt.expired_date},$or:queryArray});
    return waitingRoom;
  }
}
