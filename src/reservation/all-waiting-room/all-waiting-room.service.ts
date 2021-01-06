import { Injectable ,HttpException,HttpStatus} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model} from 'mongoose';
import {WaitingRoom} from 'src/reservation/interfaces/reservation.interface'
import { DisableCourt } from 'src/courts/disable-courts/interfaces/disable-courts.interface';

@Injectable()
export class AllWaitingRoomService {
    constructor(@InjectModel("WaitingRoom") private readonly waitingRoomModel:Model<WaitingRoom>){}

  async getWaitingRoom(id:string) : Promise<WaitingRoom> {
  
    const waitingRoom=await this.waitingRoomModel.findById(id)
    .populate('list_member','username personal_email phone').exec();
    
    if(!waitingRoom)
      throw new HttpException('Waiting room not found', HttpStatus.NOT_FOUND);
    return waitingRoom;
  }

  async getWaitingRoomSearchResult(body) : Promise<[Number,WaitingRoom[]]> {

    let reservation= this.waitingRoomModel.find().sort({ date : 1 , time_slot : -1})
        .populate('list_member','username personal_email phone');
    if(body.sportId)
    {
      reservation=reservation.find({"sport_id":body.sportId});
      if(body.courtNumber)
        reservation=reservation.find({"court_number":body.courtNumber});
    }

    if(body.date)
    { 
       body.date=new Date(body.date);
       let nextDate=new Date(body.date);
       nextDate.setDate(body.date.getDate()+1);
       reservation=reservation.find({"date":{$gte:body.date,$lt:nextDate}});
    }
    
    if(body.timeSlot)
      reservation=reservation.find({"time_slot":{$elemMatch:{$in:body.timeSlot}}});

    let result:WaitingRoom[]=await reservation;
    const length=result.length;
    if(body.start){
      
      body.start=Number(body.start);
      if(!body.end)
          result = result.slice(body.start);
      else {
          body.end=Number(body.end);
          result = result.slice(body.start,body.end);
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
      queryArray.push({time_slot:{$elemMatch:{$in:distime.time_slot}},day_of_week:distime.day});
    }

    const waitingRoom=await this.waitingRoomModel.find({ 'sport_id' : disableCourt.sport_id , 'court_num' : disableCourt.court_num,
                      'date' : { $gte : disableCourt.starting_date, $lt : disableCourt.expired_date}, $or : queryArray})
                        .sort({ date : 1 , time_slot : -1})
                        .populate('list_member','username personal_email phone');
    return waitingRoom;
  }
}
