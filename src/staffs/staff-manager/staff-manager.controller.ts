import { AdminGuard } from "./../../auth/jwt.guard"
import { Controller, Get, UseGuards, Param, Put, Body, Post, Delete, Query } from "@nestjs/common"
import { Staff, StaffList } from "../interfaces/staff.interface"
import { StaffManagerService } from "./staff-manager.service"

interface searchQuery {
  start: number
  end: number
  filter: string
  type: string
}

@UseGuards(AdminGuard)
@Controller("staff-manager")
export class StaffManagerController {
  constructor(private readonly staffManagerService: StaffManagerService) {}

  //get only one staff (by _id as param :id)
  @Get("/:id")
  async getStaff(@Param("id") id: string): Promise<Staff> {
    return await this.staffManagerService.getStaffData(id)
  }

  //promote or demote staff
  @Put("/:id")
  async updateStaffBoolean(@Param("id") id: string, @Body() input: { is_admin: boolean }): Promise<Staff> {
    return this.staffManagerService.updateStaffData(id, input.is_admin)
  }
  //regex staff name (thai language) search
  //if no filter, input filter as "filter"= $ , type_filter = all (for admins and staffs), = admin (for admins), = staff (for staffs)

  @Get("admin-and-staff/search") //   /admin-and-staff/search?start=<START>&end=<END>&filter=<FILTER>&type=<TYPE>
  async getStaffsList(@Query() query: searchQuery): Promise<StaffList> {
    return await this.staffManagerService.staffRegexQuery(query.start, query.end, query.filter, query.type)
  }

  //add staff to db (returns added staff)
  @Post("/")
  async addStaff(@Body() new_staff: Staff): Promise<Staff> {
    return await this.staffManagerService.addStaff(new_staff)
  }

  //delete staff from db using _id in param, returns deleted document
  @Delete("/:id")
  async deleteStaff(@Param("id") id: string): Promise<Staff> {
    return await this.staffManagerService.deleteStaffData(id)
  }
}
