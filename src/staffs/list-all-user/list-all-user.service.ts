import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { isValidObjectId, Model, Types } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import * as bcrypt from 'bcrypt';
import { SatitCuPersonelUser, OtherUser, User ,Account, CuStudentUser} from 'src/users/interfaces/user.interface';
import { UsersService } from "./../../users/users.service";


@Injectable()
export class listAllUserService {
    constructor(
        @InjectModel('SatitCuPersonel') private satitStudentModel: Model<SatitCuPersonelUser>,
        @InjectModel('Other') private otherUserModel: Model<OtherUser>,
        @InjectModel('CuStudent') private cuStudentModel: Model<CuStudentUser>,
        @InjectModel('User') private userModel: Model<User>,
        private readonly usersService : UsersService
        ) 
        { }


    async hashPassword(password: string): Promise<string> {
        return await bcrypt.hash(password, Number(process.env.HASH_SALT));
    }

    isThaiLang(keyword: string) {
        for (let idx = 0; idx < keyword.length; idx++) {
            if (!("A" <= keyword.charAt(idx) && keyword.charAt(idx) <= "z")) {
                return true;
            }
        }
        return false;
    }

    isEngLang(keyword: string) {
        for (let idx = 0; idx < keyword.length; idx++) {
            if ("A" <= keyword.charAt(idx) && keyword.charAt(idx) <= "z") {
                return true;
            }
        }
        return false;
    }

    async filterUser(qparam): Promise<[number,User[]]> {

        let begin : number = 0 , end : number , is_thai_language : boolean = false , has_end : boolean = false;

        if(qparam.hasOwnProperty('begin')){
            begin = qparam.begin;
            delete qparam['begin'];
        }

        if(qparam.hasOwnProperty('end')){
            end = qparam.end;
            has_end = true;
            delete qparam['end'];
        }

        if(qparam.hasOwnProperty('name')){
            is_thai_language = this.isThaiLang(qparam.name);
        }

        let seletedProperty : string = 'username is_penalize ';

        if(is_thai_language){
            seletedProperty += 'name_th surname_th';
            qparam.name_th = { $regex: ".*" + qparam.name + ".*", $options: 'i' };
        }
        else{
            seletedProperty += 'name_en surname_en';
            qparam.name_en = { $regex: ".*" + qparam.name + ".*", $options: 'i' };
        }

        delete qparam['name'];

        let temp : User[] = await this.usersService.find(qparam,seletedProperty);

        if(!has_end){
            end = temp.length;
        }

        return [ temp.length , temp.slice(begin,end) ];
    }

    async findUserByUsername(username: string): Promise<User> {
        const user = await this.userModel.findOne({ username: username });
        return user
    }
    async getUserById(id: Types.ObjectId ): Promise<User> {

        if (!isValidObjectId(id)) {
            throw new HttpException("Invalid ObjectId", HttpStatus.BAD_REQUEST);
        }

        let tempUser : User = await this.userModel.findById(id);

        if( tempUser === null ){
            throw new HttpException("Invalid User", HttpStatus.NOT_FOUND);
        }

        return tempUser;

    }

    async findUserByEmail(email: string): Promise<User> {
        const user = await this.userModel.findOne({ personal_email: email });
        return user
    }

    private checkUsername(username: string){
        return !(/^\d+$/.test(username));
    }

    async createSatitUser(user: SatitCuPersonelUser) {

        if(!this.checkUsername(user.username)){
            throw new HttpException('Please include at least one letter in username', HttpStatus.BAD_REQUEST);
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

    async createOtherUser(user: OtherUser) {

        if(!this.checkUsername(user.username)){
            throw new HttpException('Please include at least one letter in username', HttpStatus.BAD_REQUEST);
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

    async deleteUser(id : Types.ObjectId) : Promise<User> {

        if (!isValidObjectId(id)) {
            throw new HttpException("Invalid ObjectId", HttpStatus.BAD_REQUEST)
        }
        const deleteResponse = await this.userModel.findByIdAndRemove(id);
        if (!deleteResponse) {
            throw new HttpException("User not found", HttpStatus.NOT_FOUND)
        }
        return deleteResponse
    }

    async editById(id : Types.ObjectId , update ): Promise<User>{

        if (!isValidObjectId(id)) {
            throw new HttpException("Invalid ObjectId", HttpStatus.BAD_REQUEST);
        }

        let tempUser : User = await this.userModel.findByIdAndUpdate(id, update);

        if( tempUser === null ){
            throw new HttpException("Invalid User", HttpStatus.NOT_FOUND);
        }

        return tempUser;

    }

    async changePassWord( id : Types.ObjectId , body ) : Promise<User>{

        let tempUser : User = await this.getUserById(id);

        if( !body.hasOwnProperty('password') ){
            throw new HttpException("The body doesn't exist a password.", HttpStatus.CONFLICT)
        }

        const type = tempUser.account_type;
        const newHashPassWord : string = await this.hashPassword(body['password']) ;

        if(type === Account.SatitAndCuPersonel){
            (tempUser as SatitCuPersonelUser).password = newHashPassWord;
        }
        else if(type === Account.Other){
            (tempUser as OtherUser).password = newHashPassWord;
        }
        else{
            throw new HttpException("This user can't change passowrd.", HttpStatus.BAD_REQUEST)
        }

        tempUser.save();
        return tempUser
        
    }

    
}