import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
    constructor(private jwtService: JwtService){}

    generateJWT(userId: string, isStaff: boolean){
        return {token: this.jwtService.sign({userId ,isStaff})}
    }
    
}
