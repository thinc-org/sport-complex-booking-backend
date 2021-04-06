import { Module, forwardRef } from "@nestjs/common"
import { SatitApprovalService } from "./satit-approval.service"
import { SatitApprovalController } from "./satit-approval.controller"
import { UsersModule } from "src/users/users.module"
import { AuthModule } from "src/auth/auth.module"
import { StaffsModule } from "src/staffs/staffs.module"
import { FSModule } from "src/fs/fs.module"
@Module({
  imports: [forwardRef(() => UsersModule), forwardRef(() => AuthModule), StaffsModule, FSModule],
  providers: [SatitApprovalService],
  controllers: [SatitApprovalController],
  exports: [SatitApprovalModule],
})
export class SatitApprovalModule { }
