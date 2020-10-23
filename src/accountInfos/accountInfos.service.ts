import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Account, User, UserDocument, Verification } from './accountInfo.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose'
import { editAccountInfoDTO, editOtherAccountInfoDTO } from './accountInfos.dto';

@Injectable()
export class AccountInfosService {
    
    
    constructor(@InjectModel(User.name) private userModel: Model<UserDocument>){}
    
    async editOtherAccountInfo(userId: any, body: editOtherAccountInfoDTO) {
        body['verification_status'] = Verification.Submitted
        const updatedUser = await this.userModel.findByIdAndUpdate({_id:userId},body,{new: true})
        if(updatedUser == null) throw new HttpException('cannot find user: '+userId,HttpStatus.NOT_FOUND)
        return updatedUser
    }

    async editAccountInfo(userId: string, body: editAccountInfoDTO) {
        body['is_first_login'] = false
        const updatedUser = await this.userModel.findByIdAndUpdate({_id:userId},body,{new:true,lean:true})
        if(updatedUser == null) throw new HttpException('cannot find user: '+userId,HttpStatus.NOT_FOUND)
        return updatedUser
    }


    async getAccountInfo(userId : string){
        const user = await this.userModel.findById(userId)
        if(user == null) throw new HttpException('cannot find user: '+userId,HttpStatus.NOT_FOUND)
        return user
    }

    // for testing purposes only
    async addTestCuUser() {
        const testUser = new this.userModel({
            account_type: Account.CuStudent, 
            is_thai_language: true, 
            name_th: 'ชื่อทดสอบ',
            surname_th: 'นามสกุลทดสอบ',
            name_en: 'TestName',
            surname_en: 'TestSurName',
            is_penalized: false,
            is_first_login: true
        })
        const savedUser = await testUser.save()
        return savedUser
    }

     // for testing purposes only
     async addTestOtherUser() {
        const testUser = new this.userModel({
            account_type: Account.Other, 
            verification_status: Verification.NotSubmitted,
        })
        const savedUser = await testUser.save()
        return savedUser
    }

    // for testing purposes only
    async addTestUser() {
        const testUser = new this.userModel({name_en: 'Admin'})
        const savedUser = await testUser.save()
        return savedUser
    }
}
