import { Module, forwardRef } from "@nestjs/common"
import { ApprovalService } from "./approval.service"
import { ApprovalController } from "./approval.controller"
import { UsersModule } from "src/users/users.module"
import { AuthModule } from "src/auth/auth.module"
import { StaffsModule } from "src/staffs/staffs.module"
import { FSModule } from "src/fs/fs.module"
@Module({
  imports: [forwardRef(() => UsersModule), forwardRef(() => AuthModule), StaffsModule, FSModule],
  providers: [ApprovalService],
  controllers: [ApprovalController],
  exports: [ApprovalModule],
})
export class ApprovalModule { }
