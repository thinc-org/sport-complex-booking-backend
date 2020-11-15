import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { AccountInfosModule } from 'src/users/accountInfos/accountInfos.module';
import { OtherSchema } from 'src/users/schemas/users.schema';
import { UsersModule } from 'src/users/users.module';
import { FileInfo, FileInfoSchema } from './fileInfo.schema';
import { FSController } from './fs.controller';
import { FSService } from './fs.service';

@Module({
  imports: [MongooseModule.forFeature([{name: FileInfo.name, schema: FileInfoSchema}]),UsersModule,JwtModule.registerAsync({
    imports:[ConfigModule],
    useFactory: async (configService: ConfigService) => ({
      secret: configService.get<string>('JWT_SECRET'),
    }),
    inject: [ConfigService],
  }),ConfigModule],
  controllers: [FSController],
  providers: [FSService],
})
export class FSModule {}