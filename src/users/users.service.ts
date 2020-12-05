import { BadRequestException, Injectable, HttpStatus, HttpException } from '@nestjs/common';
import { Account, CuStudentUser, OtherUser, SatitCuPersonelUser, User } from './interfaces/user.interface';
import { Model, isValidObjectId } from 'mongoose';
import * as bcrypt from 'bcrypt';
import {InjectModel} from '@nestjs/mongoose';
import { SsoContent } from './interfaces/sso.interface';
import { authenticate } from 'passport';

@Injectable()
export class UsersService {
    constructor(
        @InjectModel('User') private userModel: Model<User>, 
        @InjectModel('CuStudent') private cuStudentModel: Model<CuStudentUser>, 
        @InjectModel('SatitCuPersonel') private satitStudentModel: Model<SatitCuPersonelUser>,
        @InjectModel('Other') private otherUserModel: Model<OtherUser>,

        @InjectModel('SsoContent') private ssoContent: Model<SsoContent>,
    ) { }

    async findByUsername(username: string): Promise<User> {
        const user = await this.userModel.findOne({ username: username });
        return user
    }

    async findUserById(id: string): Promise<CuStudentUser> {
        if (!isValidObjectId(id)) {
            throw new HttpException("Invalid Id", HttpStatus.BAD_REQUEST);
        }
        const acc = await this.cuStudentModel.findOne({ _id: id })
        if (!acc) {
            throw new BadRequestException("This Id does not exist.")
        }
        //return an item that has its id matches to the parameter
        return acc;
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

      //not using any will return as observable, don't know how to 
    async create_fromSso(ssoReturn: SsoContent): Promise<Account> {
        const isUsernameExist = await this.findByUsername(ssoReturn["username"]);
        if (isUsernameExist) {
            throw new HttpException("This username is already exist.", HttpStatus.BAD_REQUEST);
        }
        const newAccount = new this.cuStudentModel(
            {
                "is_thai_language": true,
                "name_th": ssoReturn["firstnameth"],
                "surname_th": ssoReturn["lastnameth"],
                "name_en": ssoReturn["firstname"],
                "surname_en": ssoReturn["lastname"],
                "username": ssoReturn["username"],
                "personal_email": ssoReturn["email"],
                "is_penalize": false,
                "is_first_login": true
            }
        );
        const acc = await newAccount.save();
        return acc["_id"];
    }
    
}
