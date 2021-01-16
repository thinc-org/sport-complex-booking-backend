import { Controller, Post, Body, UseGuards, Req, Res, Get } from "@nestjs/common"

import { ReservationService } from "./reservation.service"

import { Reservation, WaitingRoom } from "./interfaces/reservation.interface"
import { JwtAuthGuard, UserGuard } from "src/auth/jwt.guard"
import { WaitingRoomDto } from "./dto/waiting-room.dto"
import { JoinWaitingRoomDto } from "./dto/join-waiting-room.dto"

@UseGuards(UserGuard)
@Controller("reservation")
export class ReservationController {
  constructor(private readonly reservationService: ReservationService) {}

  @Post("/checkvalidity")
  async checkValidity(@Req() req, @Res() res) {
    await this.reservationService.checkValidity(req.user.userId)
    return res.status(201).json({
      statusCode: 201,
      message: "Valid user",
    })
  }

  @Post("/createwaitingroom")
  async createWaitingRoom(@Body() waitingRoomDto: WaitingRoomDto, @Req() req, @Res() res) {
    await this.reservationService.checkValidity(req.user.userId)
    await this.reservationService.createWaitingRoom(waitingRoomDto, req.user.userId)
    return res.status(201).json({
      statusCode: 201,
      message: "Waiting room created",
    })
  }

  @Post("/joinwaitingroom")
  async joinWaitingRoom(@Body() joinWaitingRoomDto: JoinWaitingRoomDto, @Req() req, @Res() res) {
    await this.reservationService.checkValidity(req.user.userId)
    const isReservationCreated = await this.reservationService.joinWaitingRoom(joinWaitingRoomDto.access_code, req.user.userId)
    return res.status(201).json({
      statusCode: 201,
      message: "Joined waiting room",
      isReservationCreated: isReservationCreated,
    })
  }

  @Post("/checkquota")
  async checkQuota(@Body() waitingRoomDto: WaitingRoomDto, @Req() req): Promise<number> {
    await this.reservationService.checkValidity(req.user.userId)
    return await this.reservationService.checkQuota(waitingRoomDto, req.user.userId)
  }

  @Post("/checktimeslot")
  async checkTimeSlot(@Body() waitingRoomDto: WaitingRoomDto, @Req() req): Promise<number[]> {
    await this.reservationService.checkValidity(req.user.userId)
    return await this.reservationService.checkTimeSlot(waitingRoomDto)
  }
}
