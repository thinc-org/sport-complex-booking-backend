import { Controller, Post , Body} from '@nestjs/common';

import { ReservationService } from "./reservation.service";

import { Reservation , WaitingRoom } from "./interfaces/reservation.interface";


@Controller('reservation')
export class ReservationController {
    constructor( private readonly reservationService: ReservationService ){}

    //Test na krub by NON
    @Post('/waitingroom')
    async createMyWaitingRoom( @Body() WaitingRoom : WaitingRoom ) : Promise<WaitingRoom>    {
        return this.reservationService.createWaitingRoom(WaitingRoom);
    }

    //Test na krub by NON
    @Post('/reservation')
    async createSuccessfulReservation( @Body() Reservation : Reservation ) : Promise<Reservation>    {
        return this.reservationService.createReservation(Reservation);
    }
}
