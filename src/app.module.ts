import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import {ApprovalModule} from './approval/approval.module'
import {UsersModule} from './users/users.module'
@Module({
  imports: [
    ConfigModule.forRoot({ envFilePath: ['.env', '.env.development'] }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URI'),
      }),
      inject: [ConfigService],
    })
    ,ApprovalModule,UsersModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
