import { ConfigModule } from '@nestjs/config';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { StaffManagerService } from './staff-manager.service';
import { StaffManagerController } from './staff-manager.controller';
import { Admin_and_staffSchema } from './schemas/admin_and_staff.schema';

@Module({
      imports: [
            ConfigModule,
            MongooseModule.forFeature([{name: 'Admin_and_staff', schema: Admin_and_staffSchema, collection: 'staffs'}]),
            
],
      controllers: [StaffManagerController],
      providers: [StaffManagerService],
      exports: [ ]
})

export class StaffManagerModule {}
      