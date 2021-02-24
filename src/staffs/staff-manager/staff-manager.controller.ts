import { CreateStaffDto, StaffBodyDTO, SearchQueryDTO, SearchResultDTO, PromoteStaffDTO } from "./../dto/create-staff.dto"
import { AdminGuard } from "./../../auth/jwt.guard"
import { Controller, Get, UseGuards, Param, Put, Body, Post, Delete, Query } from "@nestjs/common"
import { Staff, StaffList } from "../interfaces/staff.interface"
import { StaffManagerService } from "./staff-manager.service"
import { ApiBadRequestResponse, ApiBearerAuth, ApiNotFoundResponse, ApiOkResponse, ApiTags, ApiUnauthorizedResponse } from "@nestjs/swagger"

@ApiTags("staff-manager")
@ApiBearerAuth()
@ApiUnauthorizedResponse({ description: "Must be admin to use this endpoints" })
@UseGuards(AdminGuard)
@Controller("staff-manager")
export class StaffManagerController {
  constructor(private readonly staffManagerService: StaffManagerService) {}

  //get only one staff (by _id as param :id)
  @ApiOkResponse({ description: "Query results", type: CreateStaffDto })
  @ApiNotFoundResponse({ description: "Cannot find the document of the id or incorrect object id." })
  @Get("/:id")
  async getStaff(@Param("id") id: string): Promise<Staff> {
    return await this.staffManagerService.getStaffData(id)
  }

  //promote or demote staff
  @ApiOkResponse({ description: "Query results", type: CreateStaffDto })
  @ApiBadRequestResponse({
    description: "is_admin field must be a boolean.",
  })
  @ApiNotFoundResponse({ description: "Cannot find the document of the id or incorrect object id." })
  @Put("/:id")
  async updateStaffBoolean(@Param("id") id: string, @Body() input: PromoteStaffDTO): Promise<Staff> {
    return this.staffManagerService.updateStaffData(id, input.is_admin)
  }
  //regex staff name (thai language) search
  //if no filter, input filter as "filter"= $ , type_filter = all (for admins and staffs), = admin (for admins), = staff (for staffs)

  @ApiOkResponse({ description: "Query results (an array of Staffs)", type: SearchResultDTO })
  @ApiBadRequestResponse({ description: "Incorrect body", type: SearchQueryDTO })
  @Get("admin-and-staff/search") //   /admin-and-staff/search?start=<START>&end=<END>&filter=<FILTER>&type=<TYPE>
  async getStaffsList(@Query() query: SearchQueryDTO): Promise<StaffList> {
    return await this.staffManagerService.staffRegexQuery(query.start, query.end, query.filter, query.type)
  }

  //add staff to db (returns added staff)
  @Post("/")
  @ApiOkResponse({ description: "Staff added", type: CreateStaffDto })
  @ApiBadRequestResponse({ description: "Incorrect body", type: StaffBodyDTO })
  async addStaff(@Body() new_staff: CreateStaffDto): Promise<Staff> {
    return await this.staffManagerService.addStaff(new_staff)
  }

  //delete staff from db using _id in param, returns deleted document
  @ApiOkResponse({ description: "Deleted staff", type: CreateStaffDto })
  @ApiNotFoundResponse({ description: "Cannot find the document of the id or incorrect object id." })
  @Delete("/:id")
  async deleteStaff(@Param("id") id: string): Promise<Staff> {
    return await this.staffManagerService.deleteStaffData(id)
  }
}
