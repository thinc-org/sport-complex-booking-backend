import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { CourtSchema, SportSchema} from './schemas/sportCourt.schema';
import { SettingSchema } from './schemas/setting.schema';
import {CourtManagerController} from './court-manager.controller';
import { CourtManagerService } from './court-manager.service';
import { StaffsModule } from './../staffs/staffs.module';
import { UsersModule } from './../users/users.module';
import { StaffManagerModule } from './../staffs/staff-manager/staff-manager.module';
import { listAllUserModule } from './../staffs/list-all-user/list-all-user.module';

@Module({ 
      imports: [
            ConfigModule,
            StaffsModule,
            UsersModule,
            listAllUserModule,
            StaffManagerModule,
            MongooseModule.forFeature([{name: 'Courts', schema: CourtSchema}]),
            MongooseModule.forFeature([{name: 'Sport', schema: SportSchema, collection: 'List_Sport'}]),
            MongooseModule.forFeature([{name: 'Setting', schema: SettingSchema, collection: 'Setting'}]),
],
      controllers: [CourtManagerController],
      providers: [CourtManagerService],
      exports: [ 
      CourtManagerService
 ]
})
export class CourtManagerModule {}