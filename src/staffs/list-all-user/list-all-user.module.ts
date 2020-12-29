import { forwardRef, Module } from '@nestjs/common';
import { listAllUserService } from './list-all-user.service';
import { listAllUserController } from './list-all-user.controller';
import { UsersModule } from 'src/users/users.module';
import { AuthModule } from 'src/auth/auth.module';
import { StaffsModule } from '../staffs.module';

@Module({
  imports: [
    forwardRef(()=>UsersModule),
    forwardRef(()=>AuthModule),
    StaffsModule
  ],
  providers: [listAllUserService],
  controllers: [listAllUserController],
  exports: [listAllUserService]
})
export class listAllUserModule {}
