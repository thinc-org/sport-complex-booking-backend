import { JwtAuthGuard } from './../auth/jwt.guard';
import { Controller, Get, UseGuards, Param, Req, Put, HttpException, HttpStatus, Body, Post } from '@nestjs/common';
import {Admin_and_staff} from './interfaces/admin_and_staff.interface';
import {StaffManagerService} from './staff-manager.service';

@Controller('staff-manager')
export class StaffManagerController {
      constructor(private readonly staffManagerService: StaffManagerService){}

//get only one staff (by _id as param :id)
@UseGuards(JwtAuthGuard)
@Get('admin-and-staff/:id')
async getStaff(@Param('id') id: string, @Req() req): Promise<Admin_and_staff> {
      const current_staff = await this.staffManagerService.getStaffData(req.user.userId);

      if(current_staff.is_admin === false){   //if not admin
            throw new HttpException('Admin only.', HttpStatus.UNAUTHORIZED);
      }
      return await this.staffManagerService.getStaffData(id);
}

//promote or demote staff
@UseGuards(JwtAuthGuard)
@Put('admin-and-staff/:id')
async updateStaffBoolean(@Param('id') id: string ,@Body() input:{is_admin: boolean}, 
                        @Req() req): Promise<Admin_and_staff>{
      
      const current_staff = await this.staffManagerService.getStaffData(req.user.userId);
      if(current_staff.is_admin === false){       //admin can only promote
            throw new HttpException('Admin only.', HttpStatus.UNAUTHORIZED);
      }
      return this.staffManagerService.updateStaffData(id, input.is_admin);
}

//regex staff name (thai language) search 
@UseGuards(JwtAuthGuard)
@Get('/')     //size determine amount of documents return
async getStaffsList(@Body() input: {size: number, search_filter: string, type_filter: string} ,@Req() req): Promise<Admin_and_staff[]>{
      const current_staff = await this.staffManagerService.getStaffData(req.user.userId);
      if(current_staff.is_admin === false){      
            throw new HttpException('Admin only.', HttpStatus.UNAUTHORIZED);
      }
      //if no filter, input filter as "filter": "" , type_filter = all (for admins and staffs), = admin (for admins), = staff (for staffs)
      return await this.staffManagerService.limitDocRegexQuery(input.size, input.search_filter, input.type_filter); 
}

//add staff to db (returns added staff)
@UseGuards(JwtAuthGuard)
@Post('addStaff')
async addStaff(@Body() new_staff: Admin_and_staff, @Req() req) : Promise<Admin_and_staff>{
      const current_staff = await this.staffManagerService.getStaffData(req.user.userId);
      if(current_staff.is_admin === false){     
            throw new HttpException('Admin only.', HttpStatus.UNAUTHORIZED);
      }
      return await this.staffManagerService.addStaff(new_staff);
}

//delete staff from db using _id in param, returns deleted document
@UseGuards(JwtAuthGuard)
@Put('deleteStaff/:id')
async deleteStaff(@Param('id') id: string, @Req() req) : Promise<Admin_and_staff>{
      const current_staff = await this.staffManagerService.getStaffData(req.user.userId);
      if(current_staff.is_admin === false){     
            throw new HttpException('Admin only.', HttpStatus.UNAUTHORIZED);
      }
      return await this.staffManagerService.deleteStaffData(id);
}

}