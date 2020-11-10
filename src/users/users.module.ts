
import { forwardRef, Module } from '@nestjs/common';
import { getModelToken, MongooseModule } from '@nestjs/mongoose';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { AuthModule } from 'src/auth/auth.module';
import { CuStudentSchema, OtherSchema, SatitCuPersonelSchema, UserSchema } from './schemas/users.schema';

const cuStudentProviderFactory = {
    provide: getModelToken('CuStudent'),
    useFactory: (userModel) =>
        userModel.discriminator('CuStudent', CuStudentSchema),
    inject: [getModelToken('User')]
}

const satitCuPersonelProviderFactory = {
    provide: getModelToken('SatitCuPersonel'),
    useFactory: (userModel) =>
        userModel.discriminator('SatitAndCuPersonel', SatitCuPersonelSchema),
    inject: [getModelToken('User')]
}

const OtherProviderFactory = {
    provide: getModelToken('Other'),
    useFactory: (userModel) =>
        userModel.discriminator('Other', OtherSchema),
    inject: [getModelToken('User')]
}

@Module({
    imports: [
        forwardRef(()=>AuthModule),
        MongooseModule.forFeature([{ name: 'User', schema: UserSchema, collection: 'users' }])
    ],
    controllers: [UsersController],
    providers: [
        cuStudentProviderFactory,
        satitCuPersonelProviderFactory,
        OtherProviderFactory,
        UsersService
    ],
    exports: [
        MongooseModule.forFeature([{ name: 'User', schema: UserSchema, collection: 'users' } ]),
        cuStudentProviderFactory,
        satitCuPersonelProviderFactory,
        OtherProviderFactory
    ]
})
export class UsersModule { }

