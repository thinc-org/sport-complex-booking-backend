import { Injectable ,HttpException,HttpStatus} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model} from 'mongoose';
import {Reservation} from 'src/reservation/interfaces/reservation.interface'
import { DisableCourt } from 'src/courts/disable-courts/interfaces/disable-courts.interface';

@Injectable()
export class AllReservationService {

  constructor(@InjectModel("Reservation") private readonly reservationModel:Model<Reservation>){}

  async getReservation(id:string) : Promise<Reservation> {
  
    const reservation=await this.reservationModel.findById(id).exec();
    if(!reservation)
      throw new HttpException('Reservation not found', HttpStatus.NOT_FOUND);
    return reservation;
  }

  async getReservationSearchResult(sportId:string,courtNumber:number,date:Date,timeSlot:number[],start:number,end:number) : Promise<[Number,Reservation[]]> {

    let reservation= this.reservationModel.find();
    if(sportId !==undefined)
    {
      reservation=reservation.find({"sport_id":sportId});
      if(courtNumber !==undefined)
        reservation=reservation.find({"court_number":courtNumber});
    }

    if(date!=null)
    { 
       date=new Date(date);
       let nextDate=new Date(date);
       nextDate.setDate(date.getDate()+1);
       reservation=reservation.find({"date":{$gte:date,$lt:nextDate}});
    }
    
    if(timeSlot!==undefined )
      reservation=reservation.find({"time_slot":{$elemMatch:{$in:timeSlot}}});

    let result:Reservation[]=await reservation;
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
  async deleteReservation(id:string) :Promise<Reservation>
  {
    const reservation=this.reservationModel.findByIdAndRemove(id);
    if(!reservation)
      throw new HttpException('Reservation not found', HttpStatus.NOT_FOUND);
    return reservation;
  }

  async findOverlapReservation(disableCourt:DisableCourt) :Promise<Reservation[]>
  {
    let queryArray=[];
    for(const distime of disableCourt.disable_time)
    {
      queryArray.push({time_slot:{$elemMatch:{$in:distime.time_slot}},day_of_week:distime.day});
    }
    const reservation=await this.reservationModel.find({date:{$gte:disableCourt.starting_date,$lt:disableCourt.expired_date},$or:queryArray});
    return reservation;
  }

}
