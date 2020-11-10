import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
    constructor(private jwtService: JwtService){}

    generateJWT(userId: string){
        return {token: this.jwtService.sign({userId ,isStaff: false})}
    }

    generateAdminJWT(staffId: string){
        return {token: this.jwtService.sign({staffId ,isStaff: true})}
    }
}