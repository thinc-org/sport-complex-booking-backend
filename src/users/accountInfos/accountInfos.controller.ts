import { Body, Controller, Get, HttpException, HttpStatus, Post, Put, Query, Req, Res, UseGuards } from '@nestjs/common';
import { AccountInfosService } from './accountInfos.service';
import { Model } from 'mongoose'
import { JwtAuthGuard } from 'src/auth/jwt.guard'
import { AuthService } from 'src/auth/auth.service';
import { editSatitCuPersonelAccountInfoDTO, editCuAccountInfoDTO, editOtherAccountInfoDTO, editAccountInfoDto } from './accountInfos.dto';
import { validate, validateOrReject, Validator } from 'class-validator';
import { Account, User } from '../interfaces/user.interface';
import { plainToClass } from 'class-transformer';


@Controller('account_info')
export class AccountInfosController {
    constructor(private readonly accountInfoService: AccountInfosService, private authService: AuthService) { }

    
    @UseGuards(JwtAuthGuard)
    @Get()
    async getAccountInfo(@Req() req) {
        return this.accountInfoService.getAccountInfo(req.user.userId);
    }
    
    @UseGuards(JwtAuthGuard)
    @Put()
    async editAccountInfo(@Req() req, @Body() body) {
        return await this.accountInfoService.editAccountInfo(req.user.userId,body)
    }

    @UseGuards(JwtAuthGuard)
    @Post()
    async postAccountInfo(@Req() req, @Body() body){
        return await this.accountInfoService.postAccountInfo(req.user.userId,body)
    }
    

    /*
        the following endpoints are for testing purposes only
        
        These will be removed after login/signin/signup functionalities have
        been implemented 
    */

    @Get('testing/addTestCuUser')
    async addTestUser() {
        const testUser = await this.accountInfoService.addTestCuUser()
        const token = this.authService.generateDummyJWT(testUser._id).token;
        return { testUser, token }
    }
    
    @Get('testing/addTestSatitUser')
    async addTestSatitUser(){
        const testUser = await this.accountInfoService.addTestSatitUser()
        const token = this.authService.generateDummyJWT(testUser._id).token;
        return { testUser, token }
    }

    @Get('testing/addTestOtherUser')
    async addTestOtherUser() {
        const testUser = await this.accountInfoService.addTestOtherUser()
        const token = this.authService.generateDummyJWT(testUser._id).token;
        return { testUser, token }
    }
    
    @Get('testing/adminToken')
    async addTestAdmin() {
        const token = this.authService.generateDummyAdminJWT();
        return { token }
    }

    @UseGuards(JwtAuthGuard)
    @Put('testing/free_edit')
    async verifyOtherUser(@Req() req, @Body() body){
        this.accountInfoService.freeEdit(req.user.userId,body)
    }

}