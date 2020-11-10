import { Controller, Get, Post, Put, Delete, Body, Param, BadRequestException, Res, UseGuards, Req } from '@nestjs/common';
import { CreateStaffDto } from './dto/create-staff.dto';
import { StaffsService } from './staffs.service';
import { Staff } from './interfaces/staff.interface';
import { JwtAuthGuard } from 'src/auth/jwt.guard'
import { AuthService } from 'src/auth/auth.service';

@Controller('staffs')
export class StaffsController {
    constructor(private readonly staffsService: StaffsService, private authService: AuthService) { }

    
    @Get()
    findAll(): Promise<Staff[]> {
        return this.staffsService.findAll();
    }

    @Get('testing/adminToken')
    async addTestAdmin() {
        const token = this.authService.generateAdminJWT("test");
        return token
    }

    @UseGuards(JwtAuthGuard)
    @Get('/find/:id')
    async findById(@Param('id') id, @Req() req): Promise<Staff> {
        return await this.staffsService.findOne(id, req.user.isStaff);
    }
    //ยังมีerrorเรื่องobject_idอยู่นิดหน่อยแต่เดี๋ยวตอนทำsprint2ว่ากัน


    @Get('/login')
    async login(@Body() loginStaffDto: CreateStaffDto, @Res() res): Promise<string> {
        const staff = await this.staffsService.login(loginStaffDto);
        return res.status(201).json({
            statusCode: 201,
            message: 'Login successfully',
            jwt: this.authService.generateAdminJWT(staff._id).token,
        });
    }

    @UseGuards(JwtAuthGuard)
    @Post()
    async create(@Body() createStaffDto: CreateStaffDto, @Res() res, @Req() req) {
        await this.staffsService.create(createStaffDto, req.user.isStaff);

        return res.status(201).json({
            statusCode: 201,
            message: 'User added Successfully',
        });
    }

    @UseGuards(JwtAuthGuard)
    @Delete(':id')
    async delete(@Param('id') id, @Res() res, @Req() req) {
        await this.staffsService.delete(id, req.user.isStaff);
        return res.status(201).json({
            statusCode: 201,
            message: 'User deleted Successfully',
        });
    }
    //ยังมีerrorเรื่องobject_idอยู่นิดหน่อยแต่เดี๋ยวตอนทำsprint2ว่ากัน

    @UseGuards(JwtAuthGuard)
    @Put('/promote/:id')
    async promote(@Body() updateStaffDto: CreateStaffDto, @Param('id') id, @Req() req): Promise<Staff> {
        return await this.staffsService.update(id, updateStaffDto, req.user.isStaff);
    }
    //ยังมีerrorเรื่องobject_idอยู่นิดหน่อยแต่เดี๋ยวตอนทำsprint2ว่ากัน


}
