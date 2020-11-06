import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { CuStudentUser, SatitCuPersonelUser } from './interfaces/user.interface';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
    constructor(private readonly userService: UsersService){}

    @Post('/CuStudent')
    async addCuStudent(@Body() body ){
        return await this.userService.createCuUser(body)
    }

    @Post('/SatitStudent')
    async addSatitStudent(@Body() body){
        return await this.userService.createSatitUser(body)
    }

    @Get('/:id')
    async getUser(@Param('id') id : string){
        const user = await this.userService.getUserById(id);
        return user
    }

    @Get()
    async getAllUser(){
        return this.userService.getAllUser();
    }
}
