import { forwardRef, Module } from "@nestjs/common"
import { AuthModule } from "src/auth/auth.module"
import { FSModule } from "src/fs/fs.module"
import { UsersModule } from "src/users/users.module"
import { AccountInfosController } from "./accountInfos.controller"

@Module({
  imports: [forwardRef(() => UsersModule), forwardRef(() => AuthModule), FSModule],
  controllers: [AccountInfosController],
})
export class AccountInfosModule {}
