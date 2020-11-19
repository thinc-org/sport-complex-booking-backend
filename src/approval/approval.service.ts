import { Injectable ,HttpException,HttpStatus} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model} from 'mongoose';
import {  User,Verification} from 'src/users/interfaces/user.interface';

@Injectable()
export class ApprovalService {

  constructor(@InjectModel("User") private readonly userModel:Model<User>){}

  async getByRange(start:number ,end:number) : Promise<User[]> {
    
    start=Number(start);
    end=Number(end);

    const user=await this.userModel.find({verification_status:Verification.Submitted},
          {"name_en":1,"surname_en":1,"username":1}).skip(start).limit(end-start).exec();
    return user;

  }

  async getPersonalData(username:string) : Promise<User> {
  
    const user=await this.userModel.findOne({"username":username}).exec();

    if(!user)
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    return user;
  }

  async getSearchResult(query:string,start:number,end:number) : Promise<User[]> {

    start=Number(start);
    end=Number(end);
    query=String(query);
        

    if("A"<=query.charAt(0)&&query.charAt(0)<="z")
      return await this.userModel.find({ $or:[ {"name_en":{$regex:query},verification_status:Verification.Submitted} , 
            {"surname_en":{$regex:query},verification_status:Verification.Submitted} ] },{"name_en":1,"surname_en":1,"username":1}).skip(start).limit(end-start).exec();
    

    return await this.userModel.find({ $or:[ {"name_th":{$regex:query},verification_status:Verification.Submitted} , 
          {"surname_th":{$regex:query},verification_status:Verification.Submitted} ] },{"name_en":1,"surname_en":1,"username":1}).skip(start).limit(end-start).exec();
    
  }

  async approve(username:string,newExpiredDate:Date) :Promise<User>{

    const user =await this.userModel.findOneAndUpdate({"username":username}, {$set:{verification_status:Verification.Verified,account_expiration_date:newExpiredDate}} ).exec();
    if(!user)
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    return user;
  }

  async reject(username:string,info:[string]) :Promise<User>{
  
    const user =await this.userModel.updateOne({"username":username}, {$set:{verification_status:Verification.Rejected,rejected_info:info}} ).exec();

    if(!user)
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    return user;
  }

}
