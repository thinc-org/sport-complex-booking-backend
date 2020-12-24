import { Injectable } from '@nestjs/common';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';

@Injectable()
export class AuthService {
    constructor(private jwtService: JwtService){}

    generateJWT(userId: string, isStaff: boolean){
        return {token: this.jwtService.sign({userId ,isStaff})}
    }

    generateCustomJWT(payload, signOptions?: JwtSignOptions) {
        return this.jwtService.sign(payload, signOptions);
    }

    verifyJWT(jwt) {
        return this.jwtService.verify(jwt);
    }
    
}
