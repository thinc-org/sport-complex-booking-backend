import { Body, Controller, Get, HttpException, Post, Put, Req , Res, UseGuards} from '@nestjs/common';
import { Request, Response } from 'express'
import { Account, User, UserDocument } from './accountInfo.schema';
import { AccountInfosService } from './accountInfos.service';
import { Model } from 'mongoose'
import { JwtAuthGuard } from 'src/auth/jwt.guard'
import { AuthService } from 'src/auth/auth.service';
import { editAccountInfoDTO, editOtherAccountInfoDTO } from './accountInfos.dto';


@Controller('account_info')
export class AccountInfosController {
    constructor(private readonly accountInfoService: AccountInfosService, private authService: AuthService) {}

    // for testing purposes only
    @Get('addTestCuUser')
    async addTestUser(){
        const testUser = await this.accountInfoService.addTestCuUser()
        const token = this.authService.generateDummyJWT(testUser._id).token;
        return {testUser, token}
    }

    @Get('addTestOtherUser')
    async addTestOtherUser(){
        const testUser = await this.accountInfoService.addTestOtherUser()
        const token = this.authService.generateDummyJWT(testUser._id).token;
        return {testUser, token}
    }

    // for testing purposes only
    @Get('addTestAdmin')
    async addTestAdmin(){
        const testUser = await this.accountInfoService.addTestUser()
        const token = this.authService.generateDummyAdminJWT(testUser._id);
        return {testUser, token}
    }

    @UseGuards(JwtAuthGuard)
    @Get()
    async getAccountInfo(@Req() req){
        return this.accountInfoService.getAccountInfo(req.user.userId);
    }

    @UseGuards(JwtAuthGuard)
    @Put()
    async editAccountInfo(@Req() req, @Body() body: editAccountInfoDTO){
        return await this.accountInfoService.editAccountInfo(req.user.userId, body)
    }

    @UseGuards(JwtAuthGuard)
    @Put('other')
    async editOtherAccountInfo(@Req() req, @Body() body: editOtherAccountInfoDTO){
        return await this.accountInfoService.editOtherAccountInfo(req.user.userId,body)
    }

}