import { CuStudentUser } from 'src/users/interfaces/user.interface';
import { Body, Controller, Get, Param, Post, Put, Query, Res, 
         HttpService, HttpException } from '@nestjs/common';
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

    @Post('validation') //takes {"appticket": <ticket>} from front-end as body
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
                let acc;
                const db_acc = await this.userService.findByUsername(res.data['username'])
                
                if(db_acc == null){  //no doc in db (register)
                    acc = await this.userService.create_fromSso(res.data);   //return db's object id
                }else{  //there is doc in db (login)
                    acc = db_acc
                }
                const payload = this.authService.generateUserJWT(acc["_id"], 
                acc["is_first_login"], acc["is_thai_language"]);

                return payload;
            }));
            
        return res; //return payload
    }

    @Put('validation')
    async changeDBInfo  //recieve username (for query), is_thai_language, personal_email, phone
    (@Body() input:{username: string, is_thai_language: boolean, personal_email: string, phone:string}): Promise<CuStudentUser>{

        const acc = this.userService.changeData(input);
        console.log(await acc)
        return acc;
    }

}
