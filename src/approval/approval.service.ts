import { Injectable ,HttpException,HttpStatus} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model} from 'mongoose';
import {  Verification,User} from 'src/users/interfaces/user.interface';

@Injectable()
export class ApprovalService {

  constructor(@InjectModel("User") private readonly userModel:Model<User>){}

  async getPersonalData(id:string) : Promise<User> {
  
    const user=await this.userModel.findById(id).exec();
    if(!user)
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    return user;
  }

  async getSearchResult(name:string,start:number,end:number) : Promise<[Number,User[]]> {

    var user;

    if(name!==undefined){
      if("A"<=name.charAt(0)&&name.charAt(0)<="z")
        user=await this.userModel.find({ $or:[ {"name_en":{$regex:name},verification_status:Verification.Submitted} , 
              {"surname_en":{$regex:name},verification_status:Verification.Submitted} ] },{"_id":1,"name_en":1,"surname_en":1,"username":1,"name_th":1,"surname_th":1}).exec();
      else
        user=await this.userModel.find({ $or:[ {"name_th":{$regex:name},verification_status:Verification.Submitted} , 
            {"surname_th":{$regex:name},verification_status:Verification.Submitted} ] },{"_id":1,"name_en":1,"surname_en":1,"username":1,"name_th":1,"surname_th":1}).exec();
    }
    else
      user=await this.userModel.find({verification_status:Verification.Submitted});

    const length=user.length;
    
    if(start !== undefined){

      start=Number(start);
      if(end === undefined)
            user = user.slice(start);
      else {
          end=Number(end);
          user = user.slice(start,end);
      }
    }
    
    return [length,user];
  
  }
  async setApprovalstatus(id:string,isApprove:boolean,newExpiredDate:Date,reject_info:string[]) : Promise<User>
  {
    var user;
    
    if(isApprove)
      user =await this.userModel.findByIdAndUpdate(id, {$set:{verification_status:Verification.Verified,account_expiration_date:newExpiredDate}},{new:true,strict: false}).exec();
    else 
      user =await this.userModel.findByIdAndUpdate(id, {$set:{verification_status:Verification.Rejected,rejected_info:reject_info}},{new:true,strict: false}).exec();  
      
    if(!user)
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    return user;
  }
  

}
