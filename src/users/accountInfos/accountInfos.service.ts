import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { plainToClass } from 'class-transformer';
import { validateOrReject } from 'class-validator';
import { Model } from 'mongoose';
import { Account, CuStudentUser, OtherUser, SatitCuPersonelUser, User, Verification } from 'src/users/interfaces/user.interface';
import { editCuAccountInfoDTO, editOtherAccountInfoDTO, editSatitCuPersonelAccountInfoDTO, postCuAccountInfoDTO, PostOtherAccountInfoDTO } from './accountInfos.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AccountInfosService {
    constructor(
        @InjectModel('User') private userModel: Model<User>,
        @InjectModel('CuStudent') private cuStudentModel: Model<CuStudentUser>,
        @InjectModel('SatitCuPersonel') private satitStudentModel: Model<SatitCuPersonelUser>,
        @InjectModel('Other') private otherUserModel: Model<OtherUser>
    ) { }

    async getAccountInfo(userId: string) {
        const user = await this.userModel.findById(userId).select("-password").exec();
        if (user == null) throw new HttpException('cannot find user: ' + userId, HttpStatus.NOT_FOUND)
        return user
    }

    async validateData(data: any) {
        try {
            await validateOrReject(data)
        } catch (err) {
            throw new HttpException(err, HttpStatus.BAD_REQUEST)
        }
    }

    async editAccountInfo(userId: string, data: any) {
        let user = await this.userModel.findById(userId)
        if(user == null) throw new HttpException('cannot find user: ' + userId, HttpStatus.NOT_FOUND)
        const accountType = user.account_type

        let info = null

        // turn plain object into an instance of appropriate class
        switch (accountType) {
            case Account.CuStudent:
                info = plainToClass(editCuAccountInfoDTO, data, { excludeExtraneousValues: true })
                await this.validateData(info)
                return await this.editCuAccountInfo(userId, info)
                break
            case Account.SatitAndCuPersonel:
                info = plainToClass(editSatitCuPersonelAccountInfoDTO, data, { excludeExtraneousValues: true })
                await this.validateData(info)
                return await this.editSatitAccountInfo(userId, info)
                break
            case Account.Other:
                info = plainToClass(editOtherAccountInfoDTO, data, { excludeExtraneousValues: true })
                await this.validateData(info)
                return await this.editOtherAccountInfo(userId, info)
                break
            default:
                throw new HttpException('WTF', HttpStatus.I_AM_A_TEAPOT) // if this happens, something is terribly wrong.

        }
    }

    private async editOtherAccountInfo(userId: any, info: editOtherAccountInfoDTO) {
        let user = await this.otherUserModel.findById(userId)
        if (user.verification_status == Verification.Submitted || user.verification_status == Verification.Verified) {
            throw new HttpException('Please contact admin to modify account data', HttpStatus.FORBIDDEN)
        }
        let updt = {verification_status: Verification.Submitted,rejected_info:[]}
        Object.assign(updt, info)
        const updatedUser =  await this.otherUserModel.findByIdAndUpdate(userId,updt,{new: true, lean: true, omitUndefined: true}).select("-password").exec();
        if (updatedUser == null) throw new HttpException('cannot find user: ' + userId, HttpStatus.NOT_FOUND)
        return updatedUser
    }

    private async editCuAccountInfo(userId: string, info: editCuAccountInfoDTO) {
        let updt = {is_first_login: false}
        Object.assign(updt, info)
        const updatedUser =  await this.cuStudentModel.findByIdAndUpdate(userId, updt,{ new: true, lean: true, omitUndefined: true }).select("-password").exec();
        if (updatedUser == null) throw new HttpException('cannot find user: ' + userId, HttpStatus.NOT_FOUND)
        return updatedUser
    }

    private async editSatitAccountInfo(userId: string, body: editSatitCuPersonelAccountInfoDTO) {
        const updatedUser = await this.satitStudentModel.findByIdAndUpdate({ _id: userId }, body, { new: true, lean: true, omitUndefined: true }).select("-password").exec();
        if (updatedUser == null) throw new HttpException('cannot find user: ' + userId, HttpStatus.NOT_FOUND)
        return updatedUser
    }

    async postAccountInfo(userId: string, data: any) {
        let user = await this.userModel.findById(userId)
        if(user == null) throw new HttpException('cannot find user: ' + userId, HttpStatus.NOT_FOUND)
        const accountType = user.account_type

        let info = null

        // turn plain object into an instance of appropriate class
        switch (accountType) {
            case Account.CuStudent:
                info = plainToClass(postCuAccountInfoDTO, data, { excludeExtraneousValues: true })
                await this.validateData(info)
                return await this.editCuAccountInfo(userId, info)
                break
            case Account.SatitAndCuPersonel:
                info = plainToClass(editSatitCuPersonelAccountInfoDTO, data, { excludeExtraneousValues: true })
                await this.validateData(info)
                return await this.editSatitAccountInfo(userId, info)
                break
            case Account.Other:
                info = plainToClass(PostOtherAccountInfoDTO, data, { excludeExtraneousValues: true })
                await this.validateData(info)
                return await this.editOtherAccountInfo(userId, info)
                break
            default:
                throw new HttpException('WTF', HttpStatus.I_AM_A_TEAPOT) // if this happens, something is terribly wrong.

        }
    }

    async changePassword(userId: string, oldPassword: string, newPassword: string){
        const user = await this.userModel.findById(userId);
        if(user == null) throw new HttpException('cannot find user: ' + userId, HttpStatus.NOT_FOUND);

        let isMatch = false;
        let castedUser: SatitCuPersonelUser | OtherUser;

        switch(user.account_type) {
            case Account.CuStudent:
                throw new HttpException('CuStudent cannot change password', HttpStatus.FORBIDDEN);
            case Account.SatitAndCuPersonel:
                castedUser = user as SatitCuPersonelUser;
                isMatch = await bcrypt.compare(oldPassword, castedUser.password);
                break;
            case Account.Other:
                castedUser = user as OtherUser;
                isMatch = await bcrypt.compare(oldPassword, castedUser.password);
                break;
            default:
                throw new HttpException('WTF', HttpStatus.I_AM_A_TEAPOT) // if this happens, something is terribly wrong.
        }
        
        if(!isMatch) throw new HttpException('old password does not match', HttpStatus.UNAUTHORIZED);
        castedUser.password = await bcrypt.hash(newPassword, Number(process.env.HASH_SALT));
        await castedUser.save();
    }

}
