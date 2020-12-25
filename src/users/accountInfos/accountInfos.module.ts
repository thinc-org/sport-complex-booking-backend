import { forwardRef, Module } from '@nestjs/common';
import { AuthModule } from 'src/auth/auth.module';
import { UsersModule } from 'src/users/users.module';
import { AccountInfosController } from './accountInfos.controller';

@Module({
  imports: [forwardRef(()=>UsersModule),forwardRef(()=> AuthModule)],
  controllers: [AccountInfosController],
})
export class AccountInfosModule {}