import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
    constructor(private jwtService: JwtService){}

    generateJWT(userId: string){
        return {token: this.jwtService.sign({userId ,isStaff: false})}
    }

    generateUserJWT(userId: string, is_first_login: boolean, is_thai_language:boolean){ //mongoDB objectid
        return {token: this.jwtService.sign({userId ,is_first_login, is_thai_language})}
    }

    generateAdminJWT(userId: string){
        return {token: this.jwtService.sign({userId ,isStaff: true})}
    }
    
}
