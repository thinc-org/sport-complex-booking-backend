import { Controller, Get, Param, Body, UseGuards, Delete, Post } from "@nestjs/common"
import { AllReservationService } from "./all-reservation.service"
import { AdminGuard, StaffGuard } from "src/auth/jwt.guard"
import { ReservationDTO, SearchReservationResultDTO, SearchDTO } from "src/reservation/all-reservation/dto/all-reservation.dto"
import {
  ApiBearerAuth,
  ApiBody,
  ApiNotFoundResponse,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
} from "@nestjs/swagger"

@ApiTags("all-reservation")
@ApiBearerAuth()
@ApiUnauthorizedResponse({ description: "User is not logged in" })
@Controller("all-reservation")
export class AllReservationController {
  constructor(private readonly allReservationService: AllReservationService) {}

  @ApiBody({ type: SearchDTO })
  @ApiOkResponse({ description: "Return query results", type: SearchReservationResultDTO })
  @ApiForbiddenResponse({ description: "Must be staff to use this endpoints" })
  @UseGuards(StaffGuard)
  @Post()
  getSearchResult(@Body() body) {
    return this.allReservationService.getReservationSearchResult(body)
  }

  @ApiParam({ name: "id", type: String, description: "a Reservation's ID" })
  @ApiOkResponse({ description: "Return a reservation with id in param", type: ReservationDTO })
  @ApiNotFoundResponse({ description: "Can't find a reservation" })
  @ApiForbiddenResponse({ description: "Must be staff to use this endpoints" })
  @UseGuards(StaffGuard)
  @Get("/:id")
  getReservation(@Param("id") id: string) {
    return this.allReservationService.getReservation(id)
  }

  @ApiParam({ name: "id", type: String, description: "a Reservation's ID" })
  @ApiOkResponse({ description: "Delete and return a reservation with id in param", type: ReservationDTO })
  @ApiNotFoundResponse({ description: "Can't find a reservation" })
  @ApiForbiddenResponse({ description: "Must be admin to use this endpoints" })
  @UseGuards(AdminGuard)
  @Delete("/:id")
  delete(@Param("id") id: string) {
    return this.allReservationService.deleteReservation(id)
  }
}
