import { Controller, UseGuards, Get, Param, Delete, Req, Patch } from "@nestjs/common"

import { Reservation } from "./../interfaces/reservation.interface"

import { MyReservationService } from "./myreservation.service"
import { UserGuard, StaffGuard } from "src/auth/jwt.guard"

import { isValidObjectId, Types } from "mongoose"
import { HttpException, HttpStatus } from "@nestjs/common"

import { ApiBearerAuth, ApiNotFoundResponse, ApiOkResponse, ApiTags, ApiUnauthorizedResponse, ApiBadRequestResponse } from "@nestjs/swagger"

@ApiBearerAuth()
@ApiTags("myreservation")
@Controller("myreservation")
export class MyReservationController {
  constructor(private readonly myResrvationService: MyReservationService) {}

  idValidityChecker(id: Types.ObjectId) {
    if (!isValidObjectId(id)) {
      throw new HttpException("Invalid ObjectId", HttpStatus.BAD_REQUEST)
    }
  }

  @ApiBadRequestResponse({ description: "The user ID isn't invalid" })
  @ApiUnauthorizedResponse({ description: "Must be a logged in user to use this endpoints" })
  @ApiOkResponse({ description: "Return all reserveation info" })
  @UseGuards(UserGuard)
  @Get()
  async getAllReservation(@Req() req): Promise<Reservation[]> {
    this.idValidityChecker(req.user.userId)
    return this.myResrvationService.getAllMyReservation(req.user.userId)
  }

  @ApiBadRequestResponse({ description: "The user ID isn't invalid" })
  @ApiBadRequestResponse({ description: "The reservaiton ID isn't invalid" })
  @ApiUnauthorizedResponse({ description: "Must be a logged in user to use this endpoints" })
  @ApiUnauthorizedResponse({ description: "The user is not authorized for the reservation room" })
  @ApiNotFoundResponse({ description: "This reservation is not reserved" })
  @ApiOkResponse({ description: "Return reservation by the given id" })
  @UseGuards(UserGuard)
  @Get("/:id")
  async getById(@Param() param, @Req() req): Promise<Reservation> {
    this.idValidityChecker(req.user.userId)
    this.idValidityChecker(param.id)
    return this.myResrvationService.getById(req.user.userId, param.id)
  }

  @ApiBadRequestResponse({ description: "The user ID isn't invalid" })
  @ApiBadRequestResponse({ description: "The reservaiton ID isn't invalid" })
  @ApiUnauthorizedResponse({ description: "The user is not authorized for the reservation room" })
  @ApiNotFoundResponse({ description: "This reservation is not reserved" })
  @ApiUnauthorizedResponse({ description: "Must be a logged in user to use this endpoints" })
  @ApiOkResponse({ description: "Delete reservation by the given id" })
  @UseGuards(UserGuard)
  @Delete("/:id")
  async cancelReservation(@Param() param, @Req() req): Promise<Reservation> {
    this.idValidityChecker(req.user.userId)
    this.idValidityChecker(param.id)
    return this.myResrvationService.cancelMyReservation(req.user.userId, param.id)
  }

  @ApiBadRequestResponse({ description: "The reservaiton ID isn't invalid" })
  @ApiNotFoundResponse({ description: "This reservation is not reserved" })
  @ApiUnauthorizedResponse({ description: "Must be a logged in staff to use this endpoints" })
  @ApiOkResponse({ description: "Check reservation by the given id" })
  @UseGuards(StaffGuard)
  @Patch("/:id")
  async checkReservation(@Param() param): Promise<Reservation> {
    this.idValidityChecker(param.id)
    return this.myResrvationService.checkReservation(param.id)
  }
}
