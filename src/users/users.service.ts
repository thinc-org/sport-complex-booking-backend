import { BadRequestException, Injectable } from '@nestjs/common';
import { Account, CuStudentUser, OtherUser, SatitCuPersonelUser, User } from './interfaces/user.interface';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class UsersService {
    constructor(
        @InjectModel('User') private userModel: Model<User>, 
        @InjectModel('CuStudent') private cuStudentModel: Model<CuStudentUser>, 
        @InjectModel('SatitCuPersonel') private satitStudentModel: Model<SatitCuPersonelUser>,
        @InjectModel('Other') private otherUserModel: Model<OtherUser>
    ) { }

    async findByUsername(username: string): Promise<User> {
        const user = await this.userModel.findOne({ username: username });
        return user
    }

    async findSatitByid(id: string): Promise<SatitCuPersonelUser> {
        const user = await this.satitStudentModel.findOne({ _id: id });
        return user
    }

    async findOtherByid(id: string): Promise<OtherUser> {
        const user = await this.otherUserModel.findOne({ _id: id });
        return user
    }


    async login(username:string, password:string): Promise<string> {
        //if username is not exist
        let isPasswordMatching = false;
        let user = null;
        const isUsernameExist = await this.findByUsername(username);
        if (!isUsernameExist) {
          throw new BadRequestException('Username or Password is wrong');
        }

        if (isUsernameExist.account_type == 'SatitAndCuPersonel') {
            user = await this.findSatitByid(isUsernameExist._id);
            isPasswordMatching = await bcrypt.compare(password, user.password);
        }
        else{
            user = await this.findOtherByid(isUsernameExist._id);
            isPasswordMatching = await bcrypt.compare(password, user.password);
        }

        if (!isPasswordMatching){
          throw new BadRequestException('Username or Password is wrong');
        }
        return user._id;
      }
    
}
