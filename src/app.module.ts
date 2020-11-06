import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersModule } from './users/users.module';
import { StaffsModule } from './staffs/staffs.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { FSModule } from './fs/fs.module';
import { AccountInfosModule } from './users/accountInfos/accountInfos.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';


@Module({
  imports: [
    FSModule,
    AccountInfosModule,
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
    AuthModule,
    UsersModule, StaffsModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}


