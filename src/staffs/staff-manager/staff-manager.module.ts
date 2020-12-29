import { ConfigModule } from '@nestjs/config';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { StaffManagerService } from './staff-manager.service';
import { StaffManagerController } from './staff-manager.controller';
import { StaffSchema } from '../schemas/staff.schema';

@Module({
      imports: [
            ConfigModule,
            MongooseModule.forFeature([{name: 'Staff', schema: StaffSchema, collection: 'staffs'}]),
            
],
      controllers: [StaffManagerController],
      providers: [StaffManagerService],
      exports: [StaffManagerService]
})

export class StaffManagerModule {}
      