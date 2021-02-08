import { ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common"
import { AuthGuard } from "@nestjs/passport"
import { Role } from "src/common/roles"
import { StaffsService } from "src/staffs/staffs.service"
import { UsersService } from "src/users/users.service"

@Injectable()
export class JwtAuthGuard extends AuthGuard("jwt") { }

@Injectable()
export class StaffGuard extends AuthGuard("jwt") {
  constructor(private readonly staffsService: StaffsService) {
    super()
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const valid = await super.canActivate(context)
    const payload = context.switchToHttp().getRequest().user
    if (!valid || (payload.role != Role.Staff && payload.role != Role.Admin)) throw new UnauthorizedException();
    const staff = await this.staffsService.findById(context.switchToHttp().getRequest().user.userId)
    if (staff == null) throw new UnauthorizedException();
    return true;
  }
}

@Injectable()
export class AdminGuard extends AuthGuard("jwt") {
  constructor(private readonly staffsService: StaffsService) {
    super()
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const valid = await super.canActivate(context)
    const payload = context.switchToHttp().getRequest().user
    if (!valid || payload.role != Role.Admin) throw new UnauthorizedException();
    const staff = await this.staffsService.findById(context.switchToHttp().getRequest().user.userId)
    if (staff == null || !staff.is_admin) throw new UnauthorizedException();
    return true;
  }
}

@Injectable()
export class UserGuard extends AuthGuard("jwt") {
  constructor(private readonly usersService: UsersService) {
    super()
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const valid = await super.canActivate(context)
    const payload = context.switchToHttp().getRequest().user
    if (!valid || payload.role != Role.User) throw new UnauthorizedException();
    const user = await this.usersService.findById(payload.userId)
    if (user == null) throw new UnauthorizedException();
    return true;
  }
}
