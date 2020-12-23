import { BadRequestException, HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Staff } from './interfaces/staff.interface';
import { isValidObjectId, Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import * as bcrypt from 'bcrypt';

@Injectable()
export class StaffsService {
  constructor(
    @InjectModel('Staff') private readonly staffModel: Model<Staff>) { }

  async findByUsername(username: string): Promise<Staff> {
    const staff = await this.staffModel.findOne({ username: username });
    return staff
  }

  async hashPassword(password: string): Promise<string> {
    return await bcrypt.hash(password, Number(process.env.HASH_SALT));
  }

  async addFirstAdmin(){
    const staff = {
      name: "first admin",
      surname: "pass is admin",
      username: "admin",
      password: await this.hashPassword("admin"),
      is_admin: true
    }
    const isUsernameExist = await this.findByUsername(staff.username);
    if (isUsernameExist) {
      throw new HttpException('First admin is already added', HttpStatus.BAD_REQUEST);
    }
    const newStaff = new this.staffModel(staff);
    return await newStaff.save()
  }

  async login(staff: Staff): Promise<Staff> {
    //if username is not exist
    const isUsernameExist = await this.findByUsername(staff.username);
    if (!isUsernameExist) {
      throw new BadRequestException('Username or Password is wrong');
    }
    const isPasswordMatching = await bcrypt.compare(staff.password, isUsernameExist.password);
    if (!isPasswordMatching) {
      throw new BadRequestException('Username or Password is wrong');
    }
    return isUsernameExist;
  }

}
