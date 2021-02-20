import { Controller, Get, Param, Body, UseGuards, Delete, Post } from "@nestjs/common"
import { AllWaitingRoomService } from "./all-waiting-room.service"
import { StaffGuard } from "src/auth/jwt.guard"
import { WaitingRoomDTO, SearchWaitingRoomResultDTO, SearchDTO } from "src/reservation/all-reservation/dto/all-reservation.dto"
import {
  ApiBearerAuth, ApiNotFoundResponse,
  ApiOkResponse,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse, ApiBody
} from "@nestjs/swagger"

@ApiTags("all-waiting-room")
@ApiBearerAuth()
@ApiUnauthorizedResponse({ description: "Must be staff to use this endpoints" })
@UseGuards(StaffGuard)
@Controller("all-waiting-room")
export class AllWaitingRoomController {
  constructor(private readonly allWaitingRoomService: AllWaitingRoomService) { }

  @ApiBody({ type: SearchDTO })
  @ApiOkResponse({ description: "Return query results", type: SearchWaitingRoomResultDTO })
  @Post()
  getSearchResult(@Body() body) {
    return this.allWaitingRoomService.getWaitingRoomSearchResult(body)
  }

  @ApiParam({ name: "id", type: String })
  @ApiOkResponse({ description: "Return a waiting room with id in param", type: WaitingRoomDTO })
  @ApiNotFoundResponse({ description: "Can't find a waiting room" })
  @Get("/:id")
  getWaitingRoom(@Param("id") id: string) {
    return this.allWaitingRoomService.getWaitingRoom(id)
  }

  @ApiParam({ name: "id", type: String })
  @ApiOkResponse({ description: "Delete and return a waiting room with id in param", type: WaitingRoomDTO })
  @ApiNotFoundResponse({ description: "Can't find a waiting room" })
  @Delete("/:id")
  delete(@Param("id") id: string) {
    return this.allWaitingRoomService.deleteWaitingRoom(id)
  }
}
