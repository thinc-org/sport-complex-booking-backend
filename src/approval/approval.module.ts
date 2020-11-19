import { Module ,forwardRef} from '@nestjs/common';
import {ApprovalService} from "./approval.service"
import { ApprovalController } from './approval.controller';
import {UsersModule} from 'src/users/users.module'
import {AuthModule} from 'src/auth/auth.module'

@Module({
    imports:[forwardRef(()=>UsersModule),
        forwardRef(()=>AuthModule)],
    providers:[ApprovalService],
    controllers: [ApprovalController]
})
export class ApprovalModule {}
