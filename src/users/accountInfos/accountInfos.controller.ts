import { Body, Controller, Get, HttpException, HttpStatus, Post, Put, Req, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { AuthService } from 'src/auth/auth.service';
import { JwtAuthGuard } from 'src/auth/jwt.guard';
import { ChangePasswordDTO, postCuAccountInfoDTO } from './accountInfos.dto';
import { AccountInfosService } from './accountInfos.service';


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
    async editAccountInfo(@Req() req, @Body() body:postCuAccountInfoDTO) {
        if(req.user.isStaff) throw new HttpException("This is for users only",HttpStatus.FORBIDDEN)
        return await this.accountInfoService.editAccountInfo(req.user.userId,body)
    }

    @UseGuards(JwtAuthGuard)
    @Post()
    async postAccountInfo(@Req() req, @Body() body){
        if(req.user.isStaff) throw new HttpException("This is for users only",HttpStatus.FORBIDDEN)
        return await this.accountInfoService.postAccountInfo(req.user.userId,body)
    }
<<<<<<< HEAD

    @UsePipes(new ValidationPipe())
    @UseGuards(JwtAuthGuard)
    @Post('/change_password')
    async changePassword(@Body() body: ChangePasswordDTO, @Req() req){
        await this.accountInfoService.changePassword(req.user.userId, body.oldPassword, body.newPassword);
    }
=======
>>>>>>> Remove testing routes from accountInfos

}