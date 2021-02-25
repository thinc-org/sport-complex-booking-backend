import { Controller, Get, Param, Body, UseGuards, Delete, Post } from "@nestjs/common"
import { AllReservationService } from "./all-reservation.service"
import { StaffGuard } from "src/auth/jwt.guard"

@UseGuards(StaffGuard)
@Controller("all-reservation")
export class AllReservationController {
  constructor(private readonly allReservationService: AllReservationService) {}

  @Post()
  getSearchResult(@Body() body) {
    return this.allReservationService.getReservationSearchResult(body)
  }

  @Get("/:id")
  getReservation(@Param("id") id: string) {
    return this.allReservationService.getReservation(id)
  }

  @Delete("/:id")
  delete(@Param("id") id: string) {
    return this.allReservationService.deleteReservation(id)
  }
}
