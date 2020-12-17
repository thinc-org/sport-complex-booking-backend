import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { plainToClass } from 'class-transformer';
import { validateOrReject } from 'class-validator';
import { Model } from 'mongoose';
import { Account, CuStudentUser, OtherUser, SatitCuPersonelUser, User, Verification } from 'src/users/interfaces/user.interface';
import { editCuAccountInfoDTO, editOtherAccountInfoDTO, editSatitCuPersonelAccountInfoDTO, postCuAccountInfoDTO, PostOtherAccountInfoDTO } from './accountInfos.dto';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users.service';

@Injectable()
export class AccountInfosService {
    constructor( private userService: UsersService) { }

    async getAccountInfo(userId: string) {
        return await this.userService.findById(userId, '-password');
    }

    async editAccountInfo(userId: string, data: any, post: boolean) {
        const user = await this.userService.findById(userId, '-password');

        let info = null
        // turn plain object into an instance of appropriate class
        switch (user.account_type) {
            case Account.CuStudent:
                info = plainToClass(post ? postCuAccountInfoDTO : editCuAccountInfoDTO, data, { excludeExtraneousValues: true })
                await this.validateData(info)
                return await this.editCuAccountInfo(user as CuStudentUser, info)
                break
            case Account.SatitAndCuPersonel:
                info = plainToClass(editSatitCuPersonelAccountInfoDTO, data, { excludeExtraneousValues: true })
                await this.validateData(info)
                return await this.editSatitAccountInfo(user as SatitCuPersonelUser, info)
            case Account.Other:
                info = plainToClass(post ? PostOtherAccountInfoDTO : editOtherAccountInfoDTO, data, { excludeExtraneousValues: true })
                await this.validateData(info)
                return await this.editOtherAccountInfo(user as OtherUser, info)
            default:
                throw new HttpException('WTF', HttpStatus.I_AM_A_TEAPOT) // if this happens, something is terribly wrong.

        }
    }

    async changePassword(userId: string, oldPassword: string, newPassword: string){
        const user = await this.userService.findById(userId);
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

    private async validateData(data: any) {
        try {
            await validateOrReject(data)
        } catch (err) {
            throw new HttpException(err, HttpStatus.BAD_REQUEST)
        }
    }

    private async editOtherAccountInfo(user: OtherUser, info: editOtherAccountInfoDTO | PostOtherAccountInfoDTO) {
        if (user.verification_status == Verification.Submitted || user.verification_status == Verification.Verified) {
            throw new HttpException('Please contact admin to modify account data', HttpStatus.FORBIDDEN)
        }

        const updt = {verification_status: Verification.Submitted,rejected_info:[]};
        this.assignDefined(user, info, updt);

        return await user.save();
    }

    private async editCuAccountInfo(user: CuStudentUser, info: editCuAccountInfoDTO) {
        const updt = {is_first_login: false};
        this.assignDefined(user, info, updt);
        
        return await user.save();
    }

    private async editSatitAccountInfo(user: SatitCuPersonelUser, info: editSatitCuPersonelAccountInfoDTO | PostOtherAccountInfoDTO) {
        this.assignDefined(user, info);
        return user.save();
    }

    private assignDefined(target, ...sources) {
        for (const source of sources) {
            for (const key of Object.keys(source)) {
                const val = source[key];
                if (val !== undefined) {
                    target[key] = val;
                }
            }
        }
        return target;
    }

}
