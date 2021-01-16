import { ExecutionContext, Injectable } from "@nestjs/common"
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
    if (!valid) return false
    const staff = await this.staffsService.findById(context.switchToHttp().getRequest().user.userId)
    return staff != null
  }
}

@Injectable()
export class AdminGuard extends AuthGuard("jwt") {
  constructor(private readonly staffsService: StaffsService) {
    super()
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const valid = await super.canActivate(context)
    if (!valid) return false
    const staff = await this.staffsService.findById(context.switchToHttp().getRequest().user.userId)
    return staff != null && staff.is_admin
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
    if (!valid || payload.isStaff) return false
    const user = await this.usersService.findById(payload.userId)
    return user != null
  }
}
