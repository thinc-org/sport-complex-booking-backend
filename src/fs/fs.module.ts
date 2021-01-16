import { Module } from "@nestjs/common"
import { ConfigModule, ConfigService } from "@nestjs/config"
import { JwtModule } from "@nestjs/jwt"
import { MongooseModule } from "@nestjs/mongoose"
import { AuthModule } from "src/auth/auth.module"
import { StaffsModule } from "src/staffs/staffs.module"
import { UsersModule } from "src/users/users.module"
import { FileInfo, FileInfoSchema } from "./fileInfo.schema"
import { FSController } from "./fs.controller"
import { FSService } from "./fs.service"

@Module({
  imports: [MongooseModule.forFeature([{ name: FileInfo.name, schema: FileInfoSchema }]), AuthModule, UsersModule, StaffsModule, ConfigModule],
  controllers: [FSController],
  providers: [FSService],
})
export class FSModule {}
