import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { StaffsController } from './staffs.controller';
import { StaffsService } from './staffs.service';
import { StaffSchema } from './schemas/staff.schema';
import { AuthModule } from 'src/auth/auth.module';
import { UsersModule } from 'src/users/users.module';

@Module({
    imports: [MongooseModule.forFeature([
        { name: 'Staff', schema: StaffSchema, collection: 'staffs'}]),forwardRef(()=>UsersModule),
        forwardRef(()=>AuthModule)],
    controllers: [StaffsController],
    providers: [StaffsService],
    exports: [StaffsService],
})
export class StaffsModule {}
