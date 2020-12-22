import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { CourtSchema, List_SportSchema} from './schemas/sportCourt.schema';
import { SettingSchema } from './schemas/setting.schema';
import {CourtManagerController} from './court-manager.controller';
import { CourtManagerService } from './court-manager.service';
import { ApprovalModule } from 'src/approval/approval.module';

@Module({ 
      imports: [
            ConfigModule,
            MongooseModule.forFeature([{name: 'Courts', schema: CourtSchema}]),
            MongooseModule.forFeature([{name: 'List_Sport', schema: List_SportSchema, collection: 'List_Sport'}]),
            MongooseModule.forFeature([{name: 'Setting', schema: SettingSchema, collection: 'Setting'}]),
            ApprovalModule
],
      controllers: [CourtManagerController],
      providers: [CourtManagerService],
      exports: [ ]
})
export class CourtManagerModule {}
