import { ExecutionContext, ForbiddenException, Injectable, UnauthorizedException } from "@nestjs/common"
import { AuthGuard } from "@nestjs/passport"
import { StaffsService } from "src/staffs/staffs.service"
import { UsersService } from "src/users/users.service"

@Injectable()
export class JwtAuthGuard extends AuthGuard("jwt") {}

@Injectable()
export class StaffGuard extends AuthGuard("jwt") {
  constructor(private readonly staffsService: StaffsService) {
    super()
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const valid = await super.canActivate(context)
    if (!valid) throw new UnauthorizedException()
    const payload = context.switchToHttp().getRequest().user
    if (payload.role != "Staff" && payload.role != "Admin") throw new ForbiddenException() // check role in jwt
    const staff = await this.staffsService.findById(context.switchToHttp().getRequest().user.userId)
    if (staff == null) throw new UnauthorizedException() // check if user exists
    return true
  }
}

@Injectable()
export class AdminGuard extends AuthGuard("jwt") {
  constructor(private readonly staffsService: StaffsService) {
    super()
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const valid = await super.canActivate(context)
    if (!valid) throw new UnauthorizedException()
    const payload = context.switchToHttp().getRequest().user
    if (payload.role != "Admin") throw new ForbiddenException() // check role in jwt
    const staff = await this.staffsService.findById(context.switchToHttp().getRequest().user.userId)
    if (staff == null) throw new UnauthorizedException() // check if user exists
    if (!staff.is_admin) throw new ForbiddenException() // check if user is really an admin
    return true
  }
}

@Injectable()
export class UserGuard extends AuthGuard("jwt") {
  constructor(private readonly usersService: UsersService) {
    super()
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const valid = await super.canActivate(context)
    if (!valid) throw new UnauthorizedException()
    const payload = context.switchToHttp().getRequest().user
    if (payload.role != "User") throw new ForbiddenException()
    const user = await this.usersService.findById(payload.userId)
    if (user == null) throw new UnauthorizedException()
    return true
  }
}
