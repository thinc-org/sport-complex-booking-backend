import { forwardRef, Module } from "@nestjs/common"
import { ConfigModule } from "@nestjs/config"
import { MongooseModule } from "@nestjs/mongoose"
import { AuthModule } from "src/auth/auth.module"
import { StaffsModule } from "src/staffs/staffs.module"
import { UsersModule } from "src/users/users.module"
import { FileInfo, FileInfoSchema } from "./fileInfo.schema"
import { FSController } from "./fs.controller"
import { FSService } from "./fs.service"

@Module({
  imports: [
    MongooseModule.forFeature([{ name: FileInfo.name, schema: FileInfoSchema }]),
    AuthModule,
    forwardRef(() => UsersModule),
    StaffsModule,
    ConfigModule,
  ],
  controllers: [FSController],
  providers: [FSService],
  exports: [FSService],
})
export class FSModule {}
