import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {Admin_and_staff} from './interfaces/admin_and_staff.interface';
import { Model, isValidObjectId } from 'mongoose';
import * as bcrypt from 'bcrypt';

@Injectable()
export class StaffManagerService {
      constructor(
            @InjectModel('Admin_and_staff') private Admin_and_staff: Model<Admin_and_staff>,
      ){}

      
      async addStaff(new_staff: Admin_and_staff): Promise<Admin_and_staff>{
            const isUsernameExist = await this.Admin_and_staff.findOne({username: new_staff.username});
            if(isUsernameExist){
                  throw new HttpException('This staff is already exist, please select new username.', HttpStatus.BAD_REQUEST);
            }
            const staff = new this.Admin_and_staff(new_staff);
            staff.password = await bcrypt.hash(staff.password, Number(process.env.HASH_SALT));
            return await staff.save()
      }

      async getStaffData(target_id: string) : Promise<Admin_and_staff>{
            if(!isValidObjectId(target_id)){
                  throw new HttpException("Invalid Id.", HttpStatus.BAD_REQUEST);
            }
            const doc = await this.Admin_and_staff.findOne({_id: target_id});
            if(!doc){
                  throw new HttpException('No document for this staff.', HttpStatus.BAD_REQUEST);
            }
            return doc;
      }

      async updateStaffData(id: string, isAdmin:boolean) : Promise<Admin_and_staff>{
            await this.getStaffData(id);
            return await this.Admin_and_staff.findByIdAndUpdate({_id:id}, {is_admin: isAdmin}, {new:true});
      }

      async limitDocRegexQuery(size: number, search_filter: string ,type_filter: string) : Promise<Admin_and_staff[]>{
            let list_doc: Admin_and_staff[];
 
            if(type_filter.toLowerCase() === 'all'){
                  list_doc = await this.Admin_and_staff.find({name: new RegExp(search_filter,'i')}).limit(size);  
            }else if(type_filter.toLowerCase() === 'staff'){
                  list_doc = await this.Admin_and_staff.find({name: new RegExp(search_filter,'i')}).where('is_admin').equals(false).limit(size);  
            }
            else if(type_filter.toLowerCase() === 'admin'){
                  list_doc = await this.Admin_and_staff.find({name: new RegExp(search_filter,'i')}).where('is_admin').equals(true).limit(size);  
            }
            return list_doc;
      }
      
      async deleteStaffData(id: string) : Promise<Admin_and_staff>{
            await this.getStaffData(id);
            return await this.Admin_and_staff.findByIdAndDelete(id);
      }

}