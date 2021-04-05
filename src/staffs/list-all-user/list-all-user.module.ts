import { forwardRef, Module } from "@nestjs/common"
import { ListAllUserService } from "./list-all-user.service"
import { listAllUserController } from "./list-all-user.controller"
import { UsersModule } from "src/users/users.module"
import { AuthModule } from "src/auth/auth.module"
import { StaffsModule } from "../staffs.module"
import { FSModule } from "src/fs/fs.module"

@Module({
  imports: [forwardRef(() => UsersModule), forwardRef(() => AuthModule), StaffsModule, FSModule],
  providers: [ListAllUserService],
  controllers: [listAllUserController],
  exports: [ListAllUserService],
})
export class listAllUserModule {}
