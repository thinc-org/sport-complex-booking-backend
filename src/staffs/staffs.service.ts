import { BadRequestException, HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Staff } from './interfaces/staff.interface';
import { isValidObjectId, Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import * as bcrypt from 'bcrypt';

@Injectable()
export class StaffsService {
  constructor(
    @InjectModel('Staff') private readonly staffModel: Model<Staff>) { }

  async findAll(): Promise<Staff[]> {
    return await this.staffModel.find();
  }

  async findOne(id: string, isStaff: boolean): Promise<Staff> {
    if (!isStaff) {
      throw new HttpException("Staff only", HttpStatus.BAD_REQUEST)
    }
    if (!isValidObjectId(id)) {
      throw new HttpException("Invalid ObjectId", HttpStatus.BAD_REQUEST)
    }
    const staff = await this.staffModel.findOne({ _id: id });
    if (!staff) {
      throw new BadRequestException('This Id does not exist');
    }
    return staff
  }

  async findByUsername(username: string): Promise<Staff> {
    const staff = await this.staffModel.findOne({ username: username });
    return staff
  }

  async hashPassword(password: string): Promise<string> {
    return await bcrypt.hash(password, Number(process.env.HASH_SALT));
  }

  async create(staff: Staff, isStaff: boolean): Promise<Staff> {
    if (!isStaff) {
      throw new HttpException("Staff only", HttpStatus.BAD_REQUEST)
    }
    //if username already exist
    const isUsernameExist = await this.findByUsername(staff.username);
    if (isUsernameExist) {
      throw new HttpException('Username already exist', HttpStatus.BAD_REQUEST);
    }
    //hash pasword
    staff.password = await this.hashPassword(staff.password);
    const newStaff = new this.staffModel(staff);
    //create staff
    return await newStaff.save();
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

  async delete(id: string, isStaff: boolean) {
    if (!isStaff) {
      throw new HttpException("Staff only", HttpStatus.BAD_REQUEST)
    }
    if (!isValidObjectId(id)) {
      throw new HttpException("Invalid ObjectId", HttpStatus.BAD_REQUEST)
    }
    const deleteResponse = await this.staffModel.findByIdAndRemove(id);
    if (!deleteResponse) {
      throw new HttpException("Staff not found", HttpStatus.NOT_FOUND)
    }
    return deleteResponse
  }

  async update(id: string, staff: Staff, isStaff: boolean): Promise<Staff> {
    if (!isStaff) {
      throw new HttpException("Staff only", HttpStatus.BAD_REQUEST)
    }
    if (!isValidObjectId(id)) {
      throw new HttpException("Invalid ObjectId", HttpStatus.BAD_REQUEST)
    }
    const updatedResponse = await this.staffModel.findByIdAndUpdate(id, staff, { new: true });
    if (!updatedResponse) {
      throw new HttpException('Staff not found', HttpStatus.NOT_FOUND);
    }
    return updatedResponse
  }

}
