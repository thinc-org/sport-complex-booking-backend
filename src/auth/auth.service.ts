import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
    constructor(private jwtService: JwtService){}

    generateDummyJWT(userId: string){
        return {token: this.jwtService.sign({userId ,isStaff: false})}
    }

    generateDummyAdminJWT(userId: string){
        return {token: this.jwtService.sign({userId ,isStaff: true})}
    }
}
