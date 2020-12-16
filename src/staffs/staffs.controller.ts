import { Controller, Get, Post, Put, Delete, Body, Param, BadRequestException, Res, UseGuards, Req } from '@nestjs/common';
import { CreateStaffDto } from './dto/create-staff.dto';
import { StaffsService } from './staffs.service';
import { Staff } from './interfaces/staff.interface';
import { JwtAuthGuard } from 'src/auth/jwt.guard'
import { AuthService } from 'src/auth/auth.service';

@Controller('staffs')
export class StaffsController {
    constructor(private readonly staffsService: StaffsService, private authService: AuthService) { }

    //ลบก่อนส่ง
    @Post('addFirstAdmin')
    async addFirstAdmin() {
        const staff = this.staffsService.addFirstAdmin();
        return staff
    }

    @Get('/login')
    async login(@Body() loginStaffDto: CreateStaffDto, @Res() res): Promise<string> {
        const staff = await this.staffsService.login(loginStaffDto);
        return res.status(201).json({
            statusCode: 201,
            message: 'Login successfully',
            jwt: this.authService.generateAdminJWT(staff._id).token,
        });
    }

}
