import { Controller, Get, Post, Body, Res, UseGuards, Req } from "@nestjs/common"
import { CreateStaffDto, StaffLoginDTO, StaffLoginSuccessDTO, StaffProfileDTO } from "./dto/create-staff.dto"
import { StaffsService } from "./staffs.service"
import { Staff } from "./interfaces/staff.interface"
import { StaffGuard } from "src/auth/jwt.guard"
import { AuthService } from "src/auth/auth.service"
import { Role } from "src/common/roles"
import { ApiBadRequestResponse, ApiBearerAuth, ApiCreatedResponse, ApiNotFoundResponse, ApiOkResponse, ApiTags } from "@nestjs/swagger"

@ApiTags("staffs")
@Controller("staffs")
export class StaffsController {
  constructor(private readonly staffsService: StaffsService, private authService: AuthService) {}

  @ApiBearerAuth()
  @ApiNotFoundResponse({ description: "User not found" })
  @ApiBadRequestResponse({ description: "Invalid ObjectId" })
  @ApiOkResponse({ type: StaffProfileDTO })
  @UseGuards(StaffGuard)
  @Get("/profile")
  async getStaffProfile(@Req() req): Promise<Staff> {
    const staff = this.staffsService.getStaffProfile(req.user.userId)
    return staff
  }

  //ลบก่อนส่ง
  @Post("addFirstAdmin")
  async addFirstAdmin() {
    const staff = this.staffsService.addFirstAdmin()
    return staff
  }

  @ApiCreatedResponse({
    description: "Login successfully",
    type: StaffLoginSuccessDTO,
  })
  @ApiBadRequestResponse({ description: "Username or Password is wrong" })
  @Post("/login")
  async login(@Body() loginStaffDto: StaffLoginDTO, @Res() res): Promise<string> {
    const staff = await this.staffsService.login(loginStaffDto)
    return res.status(201).json({
      statusCode: 201,
      message: "Login successfully",
      jwt: this.authService.generateJWT(staff._id, staff.is_admin ? "Admin" : "Staff"),
    })
  }
}
