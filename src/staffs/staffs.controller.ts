import { Controller, Get, Post, Body, Res, UseGuards, Req } from "@nestjs/common"
import { CreateStaffDto } from "./dto/create-staff.dto"
import { StaffsService } from "./staffs.service"
import { Staff } from "./interfaces/staff.interface"
import { StaffGuard } from "src/auth/jwt.guard"
import { AuthService } from "src/auth/auth.service"

@Controller("staffs")
export class StaffsController {
  constructor(private readonly staffsService: StaffsService, private authService: AuthService) {}

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

  @Post("/login")
  async login(@Body() loginStaffDto: CreateStaffDto, @Res() res): Promise<string> {
    const staff = await this.staffsService.login(loginStaffDto)
    return res.status(201).json({
      statusCode: 201,
      message: "Login successfully",
      jwt: this.authService.generateJWT(staff._id, true).token,
    })
  }
}
