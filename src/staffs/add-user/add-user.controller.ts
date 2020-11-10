import { Controller, Get, Post, Put, Delete, Body, Param, BadRequestException, Res, UseGuards, Req } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt.guard'
import { AuthService } from 'src/auth/auth.service';
import { CreateOtherUserDto, CreateSatitUserDto } from 'src/staffs/dto/add-user.dto';
import { User } from 'src/users/interfaces/user.interface';
import { AddUserService } from './add-user.service';


@Controller('add-user')
export class AddUserController {
    constructor(private readonly addUserService: AddUserService, private authService: AuthService) {}

    @Get('/User')
    findAllUser(): Promise<User[]> {
        return this.addUserService.findAllUser();
    }

    @Get('/SatitUser')
    findAllSatitUser(): Promise<User[]> {
        return this.addUserService.findAllSatitUser();
    }

    @Get('/OtherUser')
    findAllOtherUser(): Promise<User[]> {
        return this.addUserService.findAllOtherUser();
    }

    @UseGuards(JwtAuthGuard)
    @Post('/SatitUser')
    async addSatitUser(@Body() createUserDto: CreateSatitUserDto, @Res() res, @Req() req){
        await this.addUserService.createSatitUser(createUserDto,req.user.isStaff);

        return res.status(201).json({
            statusCode: 201,
            message: 'SatitUser added Successfully',
        });
    }

    @UseGuards(JwtAuthGuard)
    @Post('/OtherUser')
    async addOtherUser(@Body() createUserDto: CreateOtherUserDto, @Res() res, @Req() req){
        await this.addUserService.createOtherUser(createUserDto,req.user.isStaff);

        return res.status(201).json({
            statusCode: 201,
            message: 'OtherUser added Successfully',
        });
    }

    @UseGuards(JwtAuthGuard)
    @Delete('/User/:id')
    async deleteUser(@Param('id') id, @Res() res, @Req() req) {
        await this.addUserService.deleteUser(id,req.user.isStaff);
        return res.status(201).json({
            statusCode: 201,
            message: 'User deleted Successfully',
        });
    }
}


