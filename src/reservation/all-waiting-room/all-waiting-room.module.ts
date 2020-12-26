import { Module ,forwardRef} from '@nestjs/common';
import { AllWaitingRoomService } from './all-waiting-room.service';
import { AllWaitingRoomController } from './all-waiting-room.controller';
import { ReservationModule } from '../reservation.module';

@Module({
  imports:[forwardRef(()=>ReservationModule)],
  providers: [AllWaitingRoomService],
  controllers: [AllWaitingRoomController]
})
export class AllWaitingRoomModule {}
