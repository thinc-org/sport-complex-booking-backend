import { forwardRef, Module } from '@nestjs/common';
import { AddUserService } from './add-user.service';
import { AddUserController } from './add-user.controller';
import { UsersModule } from 'src/users/users.module';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [forwardRef(()=>UsersModule),
    forwardRef(()=>AuthModule)],
  providers: [AddUserService],
  controllers: [AddUserController]
})
export class AddUserModule {}
