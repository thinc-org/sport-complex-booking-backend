import { Body, Controller, Get, Param, Post, Query, Res } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from 'src/auth/jwt.guard'
import { AuthService } from 'src/auth/auth.service';
import { LoginUserDto } from './dto/login-user.dto';

@Controller('users')
export class UsersController {
    constructor(private readonly userService: UsersService, private authService: AuthService){}


    @Get('/login')
    async login(@Body() loginUserDto: LoginUserDto, @Res() res): Promise<string> {
        const id  = await this.userService.login(loginUserDto.username,loginUserDto.password);
        return res.status(201).json({
            statusCode: 201,
            message: 'Login successfully',
            jwt: this.authService.generateJWT(id).token,
        });
    }
}
