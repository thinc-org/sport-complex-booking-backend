import { Injectable, HttpException, HttpStatus } from "@nestjs/common"
import { InjectModel } from "@nestjs/mongoose"
import { Staff, StaffList } from "../interfaces/staff.interface"
import { Model, isValidObjectId } from "mongoose"
import * as bcrypt from "bcrypt"

@Injectable()
export class StaffManagerService {
  constructor(@InjectModel("Staff") private Staff: Model<Staff>) {}

  async addStaff(new_staff: Staff): Promise<Staff> {
    const isUsernameExist = await this.Staff.findOne({ username: new_staff.username })
    if (isUsernameExist) {
      throw new HttpException("This staff is already exist, please select new username.", HttpStatus.BAD_REQUEST)
    }
    const staff = new this.Staff(new_staff)
    staff.password = await bcrypt.hash(staff.password, Number(process.env.HASH_SALT))
    return await staff.save()
  }

  async getStaffData(target_id: string): Promise<Staff> {
    if (!isValidObjectId(target_id)) {
      throw new HttpException("Invalid Id.", HttpStatus.BAD_REQUEST)
    }
    const doc = await this.Staff.findOne({ _id: target_id })
    if (!doc) {
      throw new HttpException("No document for this staff.", HttpStatus.BAD_REQUEST)
    }
    return doc
  }

  async updateStaffData(id: string, isAdmin: boolean): Promise<Staff> {
    if (!isValidObjectId(id)) {
      throw new HttpException("Invalid Id.", HttpStatus.BAD_REQUEST)
    }
    const updated_staff = await this.Staff.findByIdAndUpdate({ _id: id }, { is_admin: isAdmin }, { new: true })
    if (!updated_staff) {
      throw new HttpException("No document for this staff.", HttpStatus.BAD_REQUEST)
    }
    return updated_staff
  }

  //start at 0
  async staffRegexQuery(start: number, end: number, search_filter: string, type_filter: string): Promise<StaffList> {
    if (start < 0 || end < start) {
      throw new HttpException("Invalid start or end number.", HttpStatus.BAD_REQUEST)
    }

    let listDoc: Staff[]

    if (type_filter.toLowerCase() === "all") {
      listDoc = await this.Staff.find({ name: new RegExp(search_filter, "i") })
    } else if (type_filter.toLowerCase() === "staff") {
      listDoc = await this.Staff.find({ name: new RegExp(search_filter, "i") })
        .where("is_admin")
        .equals(false)
    } else if (type_filter.toLowerCase() === "admin") {
      listDoc = await this.Staff.find({ name: new RegExp(search_filter, "i") })
        .where("is_admin")
        .equals(true)
    }

    if (end >= listDoc.length) {
      end = listDoc.length
    }

    const stafflist = {
      allStaff_length: listDoc.length, //every staff in a query (not yet sliced)
      staff_list: listDoc.slice(start, end),
    }
    return stafflist
  }

  async deleteStaffData(id: string): Promise<Staff> {
    if (!isValidObjectId(id)) {
      throw new HttpException("Invalid Id.", HttpStatus.BAD_REQUEST)
    }
    const deleted_staff = await this.Staff.findByIdAndDelete(id)
    if (!deleted_staff) {
      throw new HttpException("No document for this staff.", HttpStatus.BAD_REQUEST)
    }
    return deleted_staff
  }
}
