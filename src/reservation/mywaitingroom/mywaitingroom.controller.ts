import { Controller, UseGuards, Get, Param, Delete, Req } from "@nestjs/common"
import { MywaitingroomService } from "./mywaitingroom.service"
import { WaitingRoom } from "./../interfaces/reservation.interface"
import { isValidObjectId, Types } from "mongoose"
import { HttpException, HttpStatus } from "@nestjs/common"
import { UserGuard } from "src/auth/jwt.guard"

@UseGuards(UserGuard)
@Controller("mywaitingroom")
export class MywaitingroomController {
  constructor(private readonly mywaitingroomService: MywaitingroomService) {}

  idValidityChecker(id: Types.ObjectId) {
    if (!isValidObjectId(id)) {
      throw new HttpException("Invalid ObjectId", HttpStatus.BAD_REQUEST)
    }
  }

  @Get("")
  async getWaitingRoomByUserId(@Req() req): Promise<WaitingRoom> {
    this.idValidityChecker(req.user.userId)
    return this.mywaitingroomService.getWaitingRoomByUserId(req.user.userId)
  }

  @Get("/expire/:id")
  async expireWaitingRoom(@Param() param): Promise<boolean> {
    this.idValidityChecker(param.id)
    return this.mywaitingroomService.expiredChecker(param.id)
  }

  @Delete("/exclude/:id/:userid")
  async excludeUser(@Param() param): Promise<WaitingRoom> {
    this.idValidityChecker(param.id)
    this.idValidityChecker(param.userid)
    return this.mywaitingroomService.excludeUser(param.id, param.userid)
  }

  @Delete("/cancel/:id")
  async cancelWaitingRoom(@Param() param): Promise<WaitingRoom> {
    this.idValidityChecker(param.id)
    return this.mywaitingroomService.cancelWaitingRoom(param.id)
  }
}
