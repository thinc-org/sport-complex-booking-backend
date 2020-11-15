import { Module } from '@nestjs/common';
import { AccountInfosController } from './accountInfos.controller';
import { AccountInfosService } from './accountInfos.service';
import { AuthModule } from 'src/auth/auth.module';
import {forwardRef} from '@nestjs/common';
import { UsersModule } from 'src/users/users.module';
import { MongooseModule } from '@nestjs/mongoose';
import { CuStudentSchema, OtherSchema, SatitCuPersonelSchema, UserSchema } from '../schemas/users.schema';

@Module({
  imports: [UsersModule,forwardRef(()=> AuthModule)],
  controllers: [AccountInfosController],
  providers: [AccountInfosService],
  exports: [AccountInfosService]
})
export class AccountInfosModule {}