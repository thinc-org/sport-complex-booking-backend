import { Controller, Get, Post,Query ,Patch, Put, Delete, Body, Param, BadRequestException, Res, UseGuards, Req } from '@nestjs/common';
import { StaffGuard } from 'src/auth/jwt.guard'
import { AuthService } from 'src/auth/auth.service';
import { CreateOtherUserDto, CreateSatitUserDto } from 'src/staffs/dto/add-user.dto';
import { User } from 'src/users/interfaces/user.interface';
import { listAllUserService } from './list-all-user.service';
import { Types, isValidObjectId } from 'mongoose';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { EditingDto } from "./dto/editingDto";

@UseGuards(StaffGuard)
@Controller('list-all-user')
export class listAllUserController {
    constructor(private readonly addUserService: listAllUserService, private authService: AuthService) {}

    idValidityChecker( id : Types.ObjectId ){
        if (!isValidObjectId(id)) {
            throw new HttpException("Invalid ObjectId", HttpStatus.BAD_REQUEST);
        }
    }

    @Get('/id/:id')
    async getUser(@Param('id') id : Types.ObjectId ) : Promise<User>{
        this.idValidityChecker(id);
        const user = await this.addUserService.getUserById(id);
        return user
    }

    @Get('/filter')
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

    @Delete('/:id')
    async deleteUser(@Param('id') id, @Res() res ){
        this.idValidityChecker(id);
        await this.addUserService.deleteUser(id);
        return res.status(201).json({
            statusCode: 201,
            message: 'User deleted Successfully',
        });
    }

    @Patch('/unban/:id')
    async unbanById(@Param() param ) : Promise<User>{
        this.idValidityChecker(param.id);
        return this.addUserService.editById(param.id, { is_penalize : false , expired_penalize_date : null },true);
    }

    @Put('/:id') // forExistProperty : boolean
    async editById(@Param() param,@Body() body : EditingDto ) : Promise<User>{
        this.idValidityChecker(param.id);
        if( body.hasOwnProperty('forExistProperty') ){

            const forExistProperty : boolean = body['forExistProperty'];

            delete body['forExistProperty'];

            return this.addUserService.editById(param.id,body,forExistProperty);
        }

        return this.addUserService.editById(param.id,body,true);
    }

    @Patch('/password/:id') 
    async changePassWord(@Param() param ,@Body() body ): Promise<User>{
        this.idValidityChecker(param.id);
        return this.addUserService.changePassWord(param.id,body);
    }
}


