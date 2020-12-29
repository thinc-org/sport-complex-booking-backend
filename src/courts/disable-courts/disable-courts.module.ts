import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { StaffsModule } from 'src/staffs/staffs.module';
import { DisableCourtsController } from './disable-courts.controller';
import { DisableCourtsService } from './disable-courts.service';
import { DisableCourtSchema } from './schemas/disable-courts.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: 'DisableCourt', schema: DisableCourtSchema}]), StaffsModule],
  controllers: [DisableCourtsController],
  providers: [DisableCourtsService],
  exports: [DisableCourtsService]
})
export class DisableCourtsModule {}
