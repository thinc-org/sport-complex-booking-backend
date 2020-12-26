import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { CourtSchema, SportSchema} from './schemas/sportCourt.schema';
import { SettingSchema } from './schemas/setting.schema';
import {CourtManagerController} from './court-manager.controller';
import { CourtManagerService } from './court-manager.service';


@Module({ 
      imports: [
            ConfigModule,
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