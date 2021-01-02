import { AdminGuard, JwtAuthGuard } from './../../auth/jwt.guard';
import { Controller, Get, UseGuards, Param, Req, Put, Body, Post, Delete, Query } from '@nestjs/common';
import {Staff, StaffList} from '../interfaces/staff.interface';
import {StaffManagerService} from './staff-manager.service';

@UseGuards(AdminGuard)
@Controller('staff-manager')
export class StaffManagerController {
      constructor(private readonly staffManagerService: StaffManagerService){}

//get only one staff (by _id as param :id)
@Get('/:id')
async getStaff(@Param('id') id: string, @Req() req): Promise<Staff> {
      return await this.staffManagerService.getStaffData(id);
}

//promote or demote staff
@Put('/:id')
async updateStaffBoolean(@Param('id') id: string ,@Body() input:{is_admin: boolean}, 
                        @Req() req): Promise<Staff>{

      return this.staffManagerService.updateStaffData(id, input.is_admin);
}
//regex staff name (thai language) search 
//if no filter, input filter as "filter"= $ , type_filter = all (for admins and staffs), = admin (for admins), = staff (for staffs)


@Get('/admin-and-staff/:start/:end/:filter/:type')     
async getStaffsList(@Param('start') start: number, @Param('end') end: number, @Param('filter') filter: string, 
      @Param('type') type: string ,@Req() req): Promise<StaffList>{
      
      return await this.staffManagerService.staffRegexQuery(start, end, filter, type); 
}

//add staff to db (returns added staff)
@Post('/')
async addStaff(@Body() new_staff: Staff, @Req() req) : Promise<Staff>{

      return await this.staffManagerService.addStaff(new_staff);
}

//delete staff from db using _id in param, returns deleted document
@Delete('/:id')
async deleteStaff(@Param('id') id: string, @Req() req) : Promise<Staff>{

      return await this.staffManagerService.deleteStaffData(id);
}

}