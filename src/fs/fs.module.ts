import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersModule } from 'src/users/users.module';
import { FileInfo, FileInfoSchema } from './fileInfo.schema';
import { FSController } from './fs.controller';
import { FSService } from './fs.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: FileInfo.name, schema: FileInfoSchema }]),
    UsersModule,
    ConfigModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
      }),
      inject: [ConfigService],
    })
  ],
  controllers: [FSController],
  providers: [FSService],
})
export class FSModule { }
