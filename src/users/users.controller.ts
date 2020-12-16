import { Body, Controller, Get, Param, Post, Query, Res, HttpService, HttpException } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from 'src/auth/jwt.guard'
import { AuthService } from 'src/auth/auth.service';
import { LoginUserDto } from './dto/login-user.dto';
import { map, catchError } from 'rxjs/operators';
import { ConfigService } from '@nestjs/config';

@Controller('users')
export class UsersController {
    constructor(private readonly userService: UsersService, private authService: AuthService,
        private readonly httpService: HttpService, private readonly configService: ConfigService){}


    @Get('/login')
    async login(@Body() loginUserDto: LoginUserDto, @Res() res): Promise<string> {
        const id  = await this.userService.login(loginUserDto.username,loginUserDto.password);
        return res.status(201).json({
            statusCode: 201,
            message: 'Login successfully',
            jwt: this.authService.generateJWT(id).token,
        });
    }

    @Post('validation')
    async authenticateUser(@Body() appticket: { "appticket": string }): Promise<any> {
        const params = JSON.stringify(appticket);
        const res = this.httpService.post(this.configService.get("ssoEndpoint_VALIDATE"),
            params,
            {
                headers: {
                    'DeeAppId': this.configService.get("DeeAppId"),
                    'DeeAppSecret': this.configService.get("DeeAppSecret"),
                    'DeeTicket': appticket["appticket"]
                },
            })
            .pipe(
                catchError(e => {
                    throw new HttpException(e.response.data, e.response.status);
                }),
            )
            .pipe(map(async (res) => {
                const id = this.userService.create_fromSso(res.data);
                const account = this.userService.findOtherByid(await id); //id needs to be a string
                const payload = this.authService.generateUserJWT(account["_id"], 
                account["is_first_login"], account["is_thai_language"]);

                return payload;
            }));
            
            return res;
    }

}
