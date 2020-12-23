import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersModule } from './users/users.module';
import { StaffsModule } from './staffs/staffs.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ApprovalModule } from './approval/approval.module'
import { FSModule } from './fs/fs.module';
import { AccountInfosModule } from './users/accountInfos/accountInfos.module';
import { ReservationModule } from './reservation/reservation.module';
import { DisableCourtsModule } from './courts/disable-courts/disable-courts.module';
import { StaffManagerModule } from './staff-manager/staff-manager.module';
import { CourtManagerModule } from './court-manager/court-manager.module';

@Module({
  imports: [
    UsersModule,
    ConfigModule.forRoot({ envFilePath: ['.env', '.env.development'] }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URI'),
        useFindAndModify: false
      }),
      inject: [ConfigService],
    }),
    ApprovalModule,
    UsersModule,
    AuthModule,
    StaffsModule,
    FSModule,
    AccountInfosModule,
    ReservationModule,
    DisableCourtsModule,
    CourtManagerModule,
    StaffManagerModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}


