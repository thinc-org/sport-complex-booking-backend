import { BadRequestException, HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { isValidObjectId, Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import * as bcrypt from 'bcrypt';
import { SatitCuPersonelUser, OtherUser, User } from 'src/users/interfaces/user.interface';
@Injectable()
export class AddUserService {
    constructor(
        @InjectModel('SatitCuPersonel') private satitStudentModel: Model<SatitCuPersonelUser>,
        @InjectModel('Other') private otherUserModel: Model<OtherUser>,
        @InjectModel('User') private userModel: Model<User>) { }


    async hashPassword(password: string): Promise<string> {
        return await bcrypt.hash(password, Number(process.env.HASH_SALT));
    }

    async findAllUser(): Promise<User[]> {
        return await this.userModel.find();
    }

    async findAllSatitUser(): Promise<SatitCuPersonelUser[]> {
        return await this.satitStudentModel.find();
    }

    async findAllOtherUser(): Promise<SatitCuPersonelUser[]> {
        return await this.otherUserModel.find();
    }

    async findUserByUsername(username: string): Promise<User> {
        const user = await this.userModel.findOne({ username: username });
        return user
    }

    async findUserByEmail(email: string): Promise<User> {
        const user = await this.userModel.findOne({ personal_email: email });
        return user
    }

    async createSatitUser(user: SatitCuPersonelUser,isStaff:boolean) {
        if (!isStaff){
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

    async createOtherUser(user: OtherUser,isStaff:boolean) {
        if (!isStaff){
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

    async deleteUser(id: string,isStaff:boolean) {
        if (!isStaff){
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

}