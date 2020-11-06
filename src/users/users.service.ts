import { Injectable } from '@nestjs/common';
import { Account, CuStudentUser, OtherUser, SatitCuPersonelUser, User } from './interfaces/user.interface';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class UsersService {
    constructor(
        @InjectModel('User') private userModel: Model<User>, 
        @InjectModel('CuStudent') private cuStudentModel: Model<CuStudentUser>, 
        @InjectModel('SatitCuPersonel') private satitStudentModel: Model<SatitCuPersonelUser>,
        @InjectModel('Other') private otherUserModel: Model<OtherUser>
    ) { }
    
    async createCuUser(user): Promise<CuStudentUser> {
        user.account_type = Account.CuStudent;
        const newUser = new this.cuStudentModel(user);
        return await newUser.save();
    }

    async createSatitUser(user): Promise<SatitCuPersonelUser> {
        user.account_type = Account.SatitAndCuPersonel;
        const newUser = new this.satitStudentModel(user);
        return await newUser.save();
    }

    async createOtherUser(user): Promise<OtherUser> {
        user.account_type = Account.SatitAndCuPersonel;
        const newUser = new this.otherUserModel(user);
        return await newUser.save();
    }

    async getUsers(filter): Promise<User[]> {
        return await this.userModel.find(filter);
    }

    async getUserById(id: string): Promise<User> {
        return await this.userModel.findById(id);
    }

    async getAllUser(): Promise<User[]> {
        return await this.userModel.find();
    }
}
