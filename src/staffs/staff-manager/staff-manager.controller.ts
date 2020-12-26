import { JwtAuthGuard } from '../../auth/jwt.guard';
import { Controller, Get, UseGuards, Param, Req, Put, HttpException, HttpStatus, Body, Post, Delete } from '@nestjs/common';
import {Staff} from '../interfaces/staff.interface';
import {StaffManagerService} from './staff-manager.service';

@Controller('staff-manager')
export class StaffManagerController {
      constructor(private readonly staffManagerService: StaffManagerService){}

//get only one staff (by _id as param :id)
@UseGuards(JwtAuthGuard)
@Get('/:id')
async getStaff(@Param('id') id: string, @Req() req): Promise<Staff> {
      const current_staff = await this.staffManagerService.getStaffData(req.user.userId);
      if(current_staff.is_admin === false){   //if not admin
            throw new HttpException('Admin only.', HttpStatus.UNAUTHORIZED);
      }
      return await this.staffManagerService.getStaffData(id);
}

//promote or demote staff
@UseGuards(JwtAuthGuard)
@Put('/:id')
async updateStaffBoolean(@Param('id') id: string ,@Body() input:{is_admin: boolean}, 
                        @Req() req): Promise<Staff>{

      const current_staff = await this.staffManagerService.getStaffData(req.user.userId);
      if(current_staff.is_admin === false){   //if not admin
            throw new HttpException('Admin only.', HttpStatus.UNAUTHORIZED);
      }
      return this.staffManagerService.updateStaffData(id, input.is_admin);
}

//regex staff name (thai language) search 
@UseGuards(JwtAuthGuard)
@Get('/admin-and-staff')     
async getStaffsList(@Body() input: {start: number, end: number, search_filter: string, type_filter: string} ,@Req() req): Promise<{allStaff_length: number,staff_list: Staff[]}>{
      //if no filter, input filter as "filter": "" , type_filter = all (for admins and staffs), = admin (for admins), = staff (for staffs)
      const current_staff = await this.staffManagerService.getStaffData(req.user.userId);
      if(current_staff.is_admin === false){   //if not admin
            throw new HttpException('Admin only.', HttpStatus.UNAUTHORIZED);
      }
      return await this.staffManagerService.staffRegexQuery(input.start, input.end, input.search_filter, input.type_filter); 
}

//add staff to db (returns added staff)
@UseGuards(JwtAuthGuard)
@Post('/')
async addStaff(@Body() new_staff: Staff, @Req() req) : Promise<Staff>{
      const current_staff = await this.staffManagerService.getStaffData(req.user.userId);
      if(current_staff.is_admin === false){   //if not admin
            throw new HttpException('Admin only.', HttpStatus.UNAUTHORIZED);
      }
      return await this.staffManagerService.addStaff(new_staff);
}

//delete staff from db using _id in param, returns deleted document
@UseGuards(JwtAuthGuard)
@Delete('/:id')
async deleteStaff(@Param('id') id: string, @Req() req) : Promise<Staff>{
      const current_staff = await this.staffManagerService.getStaffData(req.user.userId);
      if(current_staff.is_admin === false){   //if not admin
            throw new HttpException('Admin only.', HttpStatus.UNAUTHORIZED);
      }
      return await this.staffManagerService.deleteStaffData(id);
}

}