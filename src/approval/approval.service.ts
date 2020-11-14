import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model} from 'mongoose';
import {  OtherUser,Verification} from './interfaces/approval.interface';

@Injectable()
export class ApprovalService {

  constructor(@InjectModel("Other") private readonly otherUserModel:Model<OtherUser>){}

  /*async getAll() : Promise<OtherUser[]> {
    const user=await this.otherUserModel.find({verification_status:Verification.Submitted}).exec();
    return user;
  }*/
  
  async getByRange(start:number ,end:number) : Promise<OtherUser[]> {
    start=Number(start);
    end=Number(end);
    const user=await this.otherUserModel.find({verification_status:Verification.Submitted},{"name_en":1,"surname_en":1,"username":1}).skip(start).limit(end-start).exec();
    return user;
  }

  async getPersonalData(username:string) : Promise<OtherUser|String> {
    const user=await this.otherUserModel.findOne({"username":username}).exec();
    if(user)
      return user;
    return "user not found";
  }

  async getSearchResult(query:string,start:number,end:number) : Promise<OtherUser[]> {
    start=Number(start);
    end=Number(end);
    query=String(query);
    
    if("A"<=query.charAt(0)&&query.charAt(0)<="z")
      return await this.otherUserModel.find({ $or:[ {"name_en":{$regex:query}} , {"surname_en":{$regex:query}} ] },{"name_en":1,"surname_en":1,"username":1}).skip(start).limit(end-start).exec();
    return await this.otherUserModel.find({ $or:[ {"name_th":{$regex:query}} , {"surname_th":{$regex:query}} ] },{"name_en":1,"surname_en":1,"username":1}).skip(start).limit(end-start).exec();
    
  }

  approve(username:string,newExpiredDate:Date) {
    this.otherUserModel.updateOne({"username":username}, {$set:{verification_status:Verification.Verified,account_expiration_date:newExpiredDate}} ).exec();
  }

  reject(username:string,info:[string]) {
    this.otherUserModel.updateOne({"username":username}, {$set:{verification_status:Verification.Rejected,rejected_info:info}} ).exec();
  }

}
