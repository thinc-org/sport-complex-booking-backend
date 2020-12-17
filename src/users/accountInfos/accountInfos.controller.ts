import { Body, Controller, Get, HttpException, HttpStatus, Post, Put, Req, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { AuthService } from 'src/auth/auth.service';
import { JwtAuthGuard, UserGuard } from 'src/auth/jwt.guard';
import { ChangePasswordDTO, postCuAccountInfoDTO } from './accountInfos.dto';
import { AccountInfosService } from './accountInfos.service';

@UseGuards(UserGuard)
@Controller('account_info')
export class AccountInfosController {
    constructor(private readonly accountInfoService: AccountInfosService, private authService: AuthService) { }

    
    @Get()
    async getAccountInfo(@Req() req) {
        return this.accountInfoService.getAccountInfo(req.user.userId);
    }
    
    @Put()
    async editAccountInfo(@Req() req, @Body() body:postCuAccountInfoDTO) {
        return await this.accountInfoService.editAccountInfo(req.user.userId,body,false)
    }

    @Post()
    async postAccountInfo(@Req() req, @Body() body){
        return await this.accountInfoService.editAccountInfo(req.user.userId,body,true)
    }

    @UsePipes(new ValidationPipe())
    @Post('/change_password')
    async changePassword(@Body() body: ChangePasswordDTO, @Req() req){
        await this.accountInfoService.changePassword(req.user.userId, body.oldPassword, body.newPassword);
    }

}