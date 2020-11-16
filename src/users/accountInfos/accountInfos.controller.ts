import { Body, Controller, Get, HttpException, HttpStatus, Post, Put, Req, UseGuards } from '@nestjs/common';
import { AuthService } from 'src/auth/auth.service';
import { JwtAuthGuard } from 'src/auth/jwt.guard';
import { AccountInfosService } from './accountInfos.service';
const mongoose = require('mongoose')


@Controller('account_info')
export class AccountInfosController {
    constructor(private readonly accountInfoService: AccountInfosService, private authService: AuthService) { }

    
    @UseGuards(JwtAuthGuard)
    @Get()
    async getAccountInfo(@Req() req) {
        if(req.user.isStaff) throw new HttpException("This is for users only",HttpStatus.FORBIDDEN)
        return this.accountInfoService.getAccountInfo(req.user.userId);
    }
    
    @UseGuards(JwtAuthGuard)
    @Put()
    async editAccountInfo(@Req() req, @Body() body) {
        if(req.user.isStaff) throw new HttpException("This is for users only",HttpStatus.FORBIDDEN)
        return await this.accountInfoService.editAccountInfo(req.user.userId,body)
    }

    @UseGuards(JwtAuthGuard)
    @Post()
    async postAccountInfo(@Req() req, @Body() body){
        if(req.user.isStaff) throw new HttpException("This is for users only",HttpStatus.FORBIDDEN)
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
        const token = this.authService.generateJWT(testUser._id).token;
        return { testUser, token }
    }
    
    @Get('testing/addTestSatitUser')
    async addTestSatitUser(){
        const testUser = await this.accountInfoService.addTestSatitUser()
        const token = this.authService.generateJWT(testUser._id).token;
        return { testUser, token }
    }

    @Get('testing/addTestOtherUser')
    async addTestOtherUser() {
        const testUser = await this.accountInfoService.addTestOtherUser()
        const token = this.authService.generateJWT(testUser._id).token;
        return { testUser, token }
    }
    
    @Get('testing/adminToken')
    async addTestAdmin() {
        const token = this.authService.generateAdminJWT(mongoose.Types.ObjectId().toHexString());
        return { token }
    }

    @UseGuards(JwtAuthGuard)
    @Put('testing/free_edit')
    async verifyOtherUser(@Req() req, @Body() body){
        this.accountInfoService.freeEdit(req.user.userId,body)
    }

}