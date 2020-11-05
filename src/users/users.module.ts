import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { CuStudentSchema, OtherSchema, SatitCuPersonelSchema, UserSchema } from './schemas/users.schema';

@Module({
    imports: [MongooseModule.forFeature([
        { name: 'User', schema: UserSchema, collection: 'users' },
        { name: 'CuStudent', schema: CuStudentSchema, collection: 'users'},
        { name: 'SatitCuPersonel', schema: SatitCuPersonelSchema, collection: 'users'},
        { name: 'Other', schema: OtherSchema, collection: 'users'}
    ])],
    controllers: [UsersController],
    providers: [UsersService],
})
export class UsersModule {}