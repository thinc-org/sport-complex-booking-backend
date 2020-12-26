import { Module ,forwardRef} from '@nestjs/common';
import { AllReservationService } from './all-reservation.service';
import { AllReservationController } from './all-reservation.controller';
import { ReservationModule } from '../reservation.module';

@Module({
  imports:[forwardRef(()=>ReservationModule)],
  providers: [AllReservationService],
  controllers: [AllReservationController]
})
export class AllReservationModule {}
