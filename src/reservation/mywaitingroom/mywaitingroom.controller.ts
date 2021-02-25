import { Controller, UseGuards, Get, Param, Delete, Req } from "@nestjs/common"
import { MywaitingroomService } from "./mywaitingroom.service"
import { WaitingRoom } from "./../interfaces/reservation.interface"
import { isValidObjectId, Types } from "mongoose"
import { HttpException, HttpStatus } from "@nestjs/common"
import { UserGuard } from "src/auth/jwt.guard"
import { ApiBearerAuth, ApiNotFoundResponse, ApiOkResponse, ApiTags, ApiUnauthorizedResponse, ApiBadRequestResponse } from "@nestjs/swagger"

@ApiBearerAuth()
@ApiTags("mywaitingroom")
@ApiUnauthorizedResponse({ description: "Must be a logged in user to use this endpoints" })
@UseGuards(UserGuard)
@Controller("mywaitingroom")
export class MywaitingroomController {
  constructor(private readonly mywaitingroomService: MywaitingroomService) {}

  idValidityChecker(id: Types.ObjectId) {
    if (!isValidObjectId(id)) {
      throw new HttpException("Invalid ObjectId", HttpStatus.BAD_REQUEST)
    }
  }

  @ApiBadRequestResponse({ description: "The user ID isn't invalid" })
  @ApiNotFoundResponse({ description: "This waiting is not reserved" })
  @ApiOkResponse({ description: "Return all waiting of the given-id user" })
  @Get("")
  async getWaitingRoomByUserId(@Req() req): Promise<WaitingRoom> {
    this.idValidityChecker(req.user.userId)
    return this.mywaitingroomService.getWaitingRoomByUserId(req.user.userId)
  }

  @ApiBadRequestResponse({ description: "The user ID isn't invalid" })
  @ApiOkResponse({ description: "Check the expiration of the waiting room by the given-waiting-room id." })
  @Get("/expire/:id")
  async expireWaitingRoom(@Param() param): Promise<boolean> {
    this.idValidityChecker(param.id)
    return this.mywaitingroomService.expiredChecker(param.id)
  }

  @ApiBadRequestResponse({ description: "The user ID isn't invalid" })
  @ApiBadRequestResponse({ description: "The witing room ID isn't invalid" })
  @ApiBadRequestResponse({ description: "The user is not in the waiting room" })
  @ApiNotFoundResponse({ description: "This reservation is not reserved" })
  @ApiOkResponse({ description: "Exclude the user of the waiting room" })
  @Delete("/exclude/:id/:userid")
  async excludeUser(@Param() param): Promise<WaitingRoom> {
    this.idValidityChecker(param.id)
    this.idValidityChecker(param.userid)
    return this.mywaitingroomService.excludeUser(param.id, param.userid)
  }

  @ApiBadRequestResponse({ description: "The waiting isn't invalid" })
  @ApiNotFoundResponse({ description: "This reservation is not reserved" })
  @ApiOkResponse({ description: "Cancel the waiting room" })
  @Delete("/cancel/:id")
  async cancelWaitingRoom(@Param() param): Promise<WaitingRoom> {
    this.idValidityChecker(param.id)
    return this.mywaitingroomService.cancelWaitingRoom(param.id)
  }
}
