import { Controller, Get ,Param,Body,UseGuards, Delete} from '@nestjs/common';
import { AllReservationService } from './all-reservation.service';
import {StaffGuard } from 'src/auth/jwt.guard'

@UseGuards(StaffGuard)
@Controller('all-reservation')
export class AllReservationController {
    constructor (private readonly allReservationService:AllReservationService) {}
   
  @Get()
  getSearchResult(@Body() body){
    return this.allReservationService.getReservationSearchResult(body.sport_id ,body.court_number ,body.date ,body.time_slot ,body.start ,body.end);
  }
  
  @Get("/:id")
  getReservation(@Param('id') id:string){
    return this.allReservationService.getReservation(id);
  }

  @Delete("/delete/:id")
  delete(@Param('id') id:string){
    return this.allReservationService.deleteReservation(id);
  }

}
