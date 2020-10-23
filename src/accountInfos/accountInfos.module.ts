import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AccountInfosController } from './accountInfos.controller';
import { AccountInfosService } from './accountInfos.service';
import { User, UserSchema } from './accountInfo.schema';
import { AuthModule } from 'src/auth/auth.module';
import {forwardRef} from '@nestjs/common';

@Module({
  imports: [MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),forwardRef(()=> AuthModule)],
  controllers: [AccountInfosController],
  providers: [AccountInfosService],
  exports: [AccountInfosService]
})
export class AccountInfosModule {}