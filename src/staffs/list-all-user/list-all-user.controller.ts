import { Controller, Get, Post,Query ,Patch, Put, Delete, Body, Param, BadRequestException, Res, UseGuards, Req } from '@nestjs/common';
import { StaffGuard } from 'src/auth/jwt.guard'
import { AuthService } from 'src/auth/auth.service';
import { CreateOtherUserDto, CreateSatitUserDto } from 'src/staffs/dto/add-user.dto';
import { User } from 'src/users/interfaces/user.interface';
import { listAllUserService } from './list-all-user.service';
import { Types } from 'mongoose';



@UseGuards(StaffGuard)
@Controller('list-all-user')
export class listAllUserController {
    constructor(private readonly addUserService: listAllUserService, private authService: AuthService) {}

    @Get('/findById/:id')
    async getUser(@Param('id') id : Types.ObjectId ) : Promise<User>{
        const user = await this.addUserService.getUserById(id);
        return user
    }

    @Get('/getUser')
    async filterUser(@Query() qparam) : Promise<[number,User[]]> {
        return this.addUserService.filterUser(qparam);
    }

    @Post('/SatitUser')
    async addSatitUser(@Body() createUserDto: CreateSatitUserDto, @Res() res){
        await this.addUserService.createSatitUser(createUserDto);

        return res.status(201).json({
            statusCode: 201,
            message: 'SatitUser added Successfully',
        });
    }

    @Post('/OtherUser')
    async addOtherUser(@Body() createUserDto: CreateOtherUserDto, @Res() res){
        await this.addUserService.createOtherUser(createUserDto);

        return res.status(201).json({
            statusCode: 201,
            message: 'OtherUser added Successfully',
        });
    }

    @Delete('/User/:id')
    async deleteUser(@Param('id') id, @Res() res ){
        await this.addUserService.deleteUser(id);
        return res.status(201).json({
            statusCode: 201,
            message: 'User deleted Successfully',
        });
    }

    @Patch('/unban/:id')
    async unbanById(@Param() param ) : Promise<User>{
        return this.addUserService.editById(param.id, { is_penalize : false , expired_penalize_date : null});
    }

    @Patch('/:id')
    async editById(@Param() param,@Body() body ) : Promise<User>{
        return this.addUserService.editById(param.id,body);
    }

    @Patch('/changepw/:id') 
    async changePassWord(@Param() param ,@Body() body ): Promise<User>{
        return this.addUserService.changePassWord(param.id,body);
    }
}


