import { Controller, Post , Body} from '@nestjs/common';

import { ReservationService } from "./reservation.service";

import { SuccessfulReservation , MyWaitingRoom } from "./interfaces/reservation.interface";


@Controller('reservation')
export class ReservationController {
    constructor( private readonly reservationService: ReservationService ){}

    //Test na krub by NON
    @Post('/mywaitingroom')
    async createMyWaitingRoom( @Body() myWaitingRoom : MyWaitingRoom ) : Promise<MyWaitingRoom>    {
        return this.reservationService.createMyWaitingRoom(myWaitingRoom);
    }

    //Test na krub by NON
    @Post('/successfulReservation')
    async createSuccessfulReservation( @Body() succesfulReservation : SuccessfulReservation ) : Promise<MyWaitingRoom>    {
        return this.reservationService.createSuccessfulReservation(succesfulReservation);
    }
}
