import { Controller, Post, Body, UseGuards, Req, Res } from "@nestjs/common"

import { ReservationService } from "./reservation.service"

import { UserGuard } from "src/auth/jwt.guard"
import { WaitingRoomDto } from "./dto/waiting-room.dto"
import { JoinWaitingRoomDto, JoinWaitingRoomSuccessDto } from "./dto/join-waiting-room.dto"
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from "@nestjs/swagger"

@ApiTags("reservation")
@ApiBearerAuth()
@UseGuards(UserGuard)
@Controller("reservation")
export class ReservationController {
  constructor(private readonly reservationService: ReservationService) {}

  @ApiCreatedResponse({ description: "Valid user" })
  @ApiNotFoundResponse({ description: "reason: USER_NOT_FOUND, it means user not found" })
  @ApiForbiddenResponse({
    description:
      "reason: NOT_VERIFIED, it means your account has to verify first. <br/> reason: ACCOUNT_EXPIRED, it means your account has already expired, please contact staff. <br/> reason: BANNED, it means your account has been banned, please contact staff.",
  })
  @ApiUnauthorizedResponse({ description: "reason: INFO_NOT_FILLED, it means you have to fill your info first" })
  @ApiConflictResponse({ description: "reason: DUPLICATE_ROOM, it means you already have waiting room" })
  @Post("/checkvalidity")
  async checkValidity(@Req() req, @Res() res) {
    await this.reservationService.checkValidity(req.user.userId)
    return res.status(201).json({
      statusCode: 201,
      message: "Valid user",
    })
  }

  @ApiCreatedResponse({ description: "Waiting room created" })
  @ApiBadRequestResponse({
    description:
      "reason: INVALID_DATE, it means you cannot reserve the past date or the time in advance over 7 days. <br/> reason: SLOT_UNAVAILABLE, it means your chosen time is unavailable. <br/> reason: TIME_NOT_CONSECUTIVE, it means your time slots have to be consecutive.",
  })
  @ApiUnauthorizedResponse({ description: "reason: NOT_ENOUGH_QUOTA, it means you do not have enough quotas" })
  @ApiNotFoundResponse({
    description: "reason: SPORT_NOT_FOUND, it means this sport does not exist. <br/> reason: COURT_NOT_FOUND, it means this court does not exist.",
  })
  @Post("/createwaitingroom")
  async createWaitingRoom(@Body() waitingRoomDto: WaitingRoomDto, @Req() req, @Res() res) {
    await this.reservationService.checkValidity(req.user.userId)
    const waitingRoom = await this.reservationService.createWaitingRoom(waitingRoomDto, req.user.userId)
    const isReservationCreated = await this.reservationService.joinWaitingRoom(waitingRoom.access_code, req.user.userId)
    return res.status(201).json({
      statusCode: 201,
      message: "Created waiting room",
      isReservationCreated: isReservationCreated,
    })
  }

  @ApiCreatedResponse({
    description: "Joined waiting room",
    type: JoinWaitingRoomSuccessDto,
  })
  @ApiBadRequestResponse({ description: "reason: WRONG_CODE, it means the code is wrong" })
  @ApiUnauthorizedResponse({ description: "reason: NOT_ENOUGH_QUOTA, it means you do not have enough quotas" })
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

  @ApiOkResponse({
    description: "the number received from this api is quota of that sport in that day",
    type: Number,
  })
  @ApiBadRequestResponse({
    description:
      "reason: INVALID_DATE, it means you cannot reserve the past date or the time in advance over 7 days. <br/> reason: INVALID_ID, it means invalid object id of sport",
  })
  @ApiNotFoundResponse({ description: "reason: SPORT_NOT_FOUND, it means this sport does not exist." })
  @Post("/checkquota")
  async checkQuota(@Body() waitingRoomDto: WaitingRoomDto, @Req() req): Promise<number> {
    await this.reservationService.checkValidity(req.user.userId)
    return await this.reservationService.checkQuota(waitingRoomDto, req.user.userId)
  }

  @ApiOkResponse({
    description: "the list of number received from this api is avaliable time slot of that sport in that day",
    type: [Number],
  })
  @ApiBadRequestResponse({
    description:
      "reason: INVALID_DATE, it means you cannot reserve the past date or the time in advance over 7 days. <br/> reason: INVALID_ID, it means invalid object id of sport",
  })
  @ApiNotFoundResponse({
    description: "reason: SPORT_NOT_FOUND, it means this sport does not exist. <br/> reason: COURT_NOT_FOUND, it means this court does not exist.",
  })
  @Post("/checktimeslot")
  async checkTimeSlot(@Body() waitingRoomDto: WaitingRoomDto, @Req() req): Promise<number[]> {
    await this.reservationService.checkValidity(req.user.userId)
    return await this.reservationService.checkTimeSlot(waitingRoomDto)
  }
}
