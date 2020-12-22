import { Controller, Get, Post,Query ,Patch, Put, Delete, Body, Param, BadRequestException, Res, UseGuards, Req } from '@nestjs/common';
import { JwtAuthGuard, StaffGuard } from 'src/auth/jwt.guard'
import { AuthService } from 'src/auth/auth.service';
import { CreateOtherUserDto, CreateSatitUserDto } from 'src/staffs/dto/add-user.dto';
import { User } from 'src/users/interfaces/user.interface';
import { listAllUserService } from './list-all-user.service';
import { promises } from 'dns';


@UseGuards(StaffGuard)
@Controller('list-all-user')
export class listAllUserController {
    constructor(private readonly addUserService: listAllUserService, private authService: AuthService) {}

    @Get('/findById/:id')
    async getUser(@Param('id') id : string, @Req() req) : Promise<User>{
        const user = await this.addUserService.getUserById(id);
        return user
    }

    @Get('/getUser')
    async filterUser(@Req() req,@Query() param) : Promise<[number,User[]]> {
        return this.addUserService.getUsers(param.name,param.penalize,param.begin,param.end,param.account);
    }

    @Post('/SatitUser')
    async addSatitUser(@Body() createUserDto: CreateSatitUserDto, @Res() res, @Req() req){
        await this.addUserService.createSatitUser(createUserDto);

        return res.status(201).json({
            statusCode: 201,
            message: 'SatitUser added Successfully',
        });
    }

    @Post('/OtherUser')
    async addOtherUser(@Body() createUserDto: CreateOtherUserDto, @Res() res, @Req() req){
        await this.addUserService.createOtherUser(createUserDto);

        return res.status(201).json({
            statusCode: 201,
            message: 'OtherUser added Successfully',
        });
    }

    @Delete('/User/:id')
    async deleteUser(@Param('id') id, @Res() res, @Req() req){
        await this.addUserService.deleteUser(id);
        return res.status(201).json({
            statusCode: 201,
            message: 'User deleted Successfully',
        });
    }

    @Patch('/unban/:id')
    async unbanById(@Param() param, @Req() req) : Promise<User>{
        return this.addUserService.unbanById(param.id);
    }

    @Patch('/:id')
    async editById(@Param() param,@Body() body, @Req() req) : Promise<User>{
        return this.addUserService.editById(param.id,body);
    }

    @Patch('/changePW/:id/:newPassWord') 
    async chanegPassWord(@Param() param, @Req() req): Promise<User>{
        return this.addUserService.changePassWord(param.id,param.newPassWord);
    }
}


