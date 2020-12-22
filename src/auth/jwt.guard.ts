import { ExecutionContext, HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Observable } from 'rxjs';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}

@Injectable()
export class StaffGuard extends AuthGuard('jwt') {
    canActivate(
        context: ExecutionContext,
    ): boolean | Promise<boolean> | Observable<boolean> {
        return super.canActivate(context);
    }

    handleRequest(err, user, info) {
        if (err || !user?.isStaff) {
          throw err || new HttpException('Not a Staff', HttpStatus.UNAUTHORIZED);
        }
        return user;
      }
    
}

@Injectable()
export class UserGuard extends AuthGuard('jwt') {
    canActivate(
        context: ExecutionContext,
    ): boolean | Promise<boolean> | Observable<boolean> {
        return super.canActivate(context);
    }

    handleRequest(err, user, info) {
        if (err || user?.isStaff) {
          throw err || new HttpException('For User Only', HttpStatus.UNAUTHORIZED);
        }
        return user;
      }
    
}