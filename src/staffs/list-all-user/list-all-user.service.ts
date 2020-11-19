import { BadRequestException, HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { isValidObjectId, Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import * as bcrypt from 'bcrypt';
import { SatitCuPersonelUser, OtherUser, User } from 'src/users/interfaces/user.interface';


@Injectable()
export class listAllUserService {
    constructor(
        @InjectModel('SatitCuPersonel') private satitStudentModel: Model<SatitCuPersonelUser>,
        @InjectModel('Other') private otherUserModel: Model<OtherUser>,
        @InjectModel('User') private userModel: Model<User>) { }


    async hashPassword(password: string): Promise<string> {
        return await bcrypt.hash(password, Number(process.env.HASH_SALT));
    }

    async isThaiLang(keyword: string): Promise<boolean> {
        for (var idx = 0; idx < keyword.length; idx++) {
            if (!("A" <= keyword.charAt(idx) && keyword.charAt(idx) <= "z")) {
                return true;
            }
        }
        return false;
    }

    async isEngLang(keyword: string): Promise<boolean> {
        for (var idx = 0; idx < keyword.length; idx++) {
            if ("A" <= keyword.charAt(idx) && keyword.charAt(idx) <= "z") {
                return true;
            }
        }
        return false;
    }

    async getUsers(filter, isStaff: boolean): Promise<[number,User[]]> {
        if (!isStaff) {
            throw new HttpException("Staff only", HttpStatus.BAD_REQUEST)
        }        
        var query = this.userModel.find();
        if (filter.hasOwnProperty('name')) {
            if (await this.isEngLang(filter.name)) {
                query = query.find({ name_en: { $regex: ".*" + filter.name + ".*", $options: 'i' } });
            }
            if (await this.isThaiLang(filter.name)) {
                query = query.find({ name_th: { $regex: ".*" + filter.name + ".*", $options: 'i' } });
            }
        }
        var begin = -99,end = -99;
        if (filter.hasOwnProperty('begin')) {
            if (filter.hasOwnProperty('end')) {
                end = filter.end;
            }
            begin = filter.begin;
        }

        delete filter['name'];
        delete filter['begin'];
        delete filter['end'];

        query = query.find(filter);

        var output = await query;

        if (begin != -99) {
            if (end != -99) {
                output = output.slice(begin, end);
            }
            else {
                output = output.slice(begin);
            }
        }

        return [output.length,output];
    }

    async findUserByUsername(username: string): Promise<User> {
        const user = await this.userModel.findOne({ username: username });
        return user
    }
    async getUserById(id: string, isStaff: boolean): Promise<User> {
        if (!isStaff) {
            throw new HttpException("Staff only", HttpStatus.BAD_REQUEST)
        }
        return await this.userModel.findById(id);
    }

    async findUserByEmail(email: string): Promise<User> {
        const user = await this.userModel.findOne({ personal_email: email });
        return user
    }

    async createSatitUser(user: SatitCuPersonelUser, isStaff: boolean) {
        if (!isStaff) {
            throw new HttpException("Staff only", HttpStatus.BAD_REQUEST)
        }
        //if username already exist
        const isUsernameExist = await this.findUserByUsername(user.username);
        if (isUsernameExist) {
            throw new HttpException('Username already exist', HttpStatus.BAD_REQUEST);
        }

        const isEmailExist = await this.findUserByEmail(user.personal_email);
        if (isEmailExist) {
            throw new HttpException('This Email is already used', HttpStatus.BAD_REQUEST);
        }

        //hash pasword
        user.password = await this.hashPassword(user.password);
        user.is_penalize = false;
        user.expired_penalize_date = null;
        const newUser = new this.satitStudentModel(user);
        //create user
        await newUser.save();
    }

    async createOtherUser(user: OtherUser, isStaff: boolean) {
        if (!isStaff) {
            throw new HttpException("Staff only", HttpStatus.BAD_REQUEST)
        }
        //if username already exist
        const isUsernameExist = await this.findUserByUsername(user.username);
        if (isUsernameExist) {
            throw new HttpException('Username already exist', HttpStatus.BAD_REQUEST);
        }

        //hash pasword
        user.is_thai_language = true;
        user.password = await this.hashPassword(user.password);
        user.is_penalize = false;
        user.expired_penalize_date = null;
        const newUser = new this.otherUserModel(user);
        //create staff
        await newUser.save();
    }

    async deleteUser(id: string, isStaff: boolean) {
        if (!isStaff) {
            throw new HttpException("Staff only", HttpStatus.BAD_REQUEST)
        }
        if (!isValidObjectId(id)) {
            throw new HttpException("Invalid ObjectId", HttpStatus.BAD_REQUEST)
        }
        const deleteResponse = await this.userModel.findByIdAndRemove(id);
        if (!deleteResponse) {
            throw new HttpException("User not found", HttpStatus.NOT_FOUND)
        }
        return deleteResponse
    }

    async unbanById(id, isStaff: boolean): Promise<User>{
        if (!isStaff) {
            throw new HttpException("Staff only", HttpStatus.BAD_REQUEST)
        }
        if (!isValidObjectId(id)) {
            throw new HttpException("Invalid ObjectId", HttpStatus.BAD_REQUEST)
        }
        const updatedResponse = await this.userModel.findByIdAndUpdate(id,{is_penalize:false}, {useFindAndModify: false});
        if (!updatedResponse) {
          throw new HttpException('Staff not found', HttpStatus.NOT_FOUND);
        }
        return updatedResponse
    }

    async editById(id , update, isStaff: boolean): Promise<User>{
        if (!isStaff) {
            throw new HttpException("Staff only", HttpStatus.BAD_REQUEST)
        }
        if (!isValidObjectId(id)) {
            throw new HttpException("Invalid ObjectId", HttpStatus.BAD_REQUEST)
        }
        const updatedResponse = await this.userModel.findByIdAndUpdate(id,update, {useFindAndModify: false});
        if (!updatedResponse) {
          throw new HttpException('Staff not found', HttpStatus.NOT_FOUND);
        }
        return updatedResponse
      }
}