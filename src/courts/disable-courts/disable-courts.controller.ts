import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards, UsePipes, ValidationPipe } from "@nestjs/common"
import { ApiBearerAuth, ApiBody, ApiConflictResponse, ApiNotFoundResponse, ApiOkResponse, ApiTags, ApiUnauthorizedResponse } from "@nestjs/swagger"
import { AdminGuard, StaffGuard } from "src/auth/jwt.guard"
import {
  CreateDisableCourtDTO,
  DeleteDisableCourtDTO,
  DisableCourtDTO,
  EditDisableCourtDTO,
  QueryDisableCourtDTO,
  QueryResult,
} from "./disable-courts.dto"
import { DisableCourtsService } from "./disable-courts.service"
import { DisableCourt } from "./interfaces/disable-courts.interface"

@ApiTags("disable-court")
@ApiBearerAuth()
@UsePipes(new ValidationPipe({ transform: true }))
@Controller("courts/disable-courts")
export class DisableCourtsController {
  constructor(private readonly disableCourtsService: DisableCourtsService) {}

  @ApiUnauthorizedResponse({ description: "Must be admin to use this endpoints" })
  @ApiConflictResponse({ description: "Can't create a disable court because there are some overlapping time/reservations" })
  @ApiOkResponse({ description: "Created a disable court", type: DisableCourtDTO })
  @UseGuards(AdminGuard)
  @Post()
  async createDisableCourt(@Body() body: CreateDisableCourtDTO): Promise<DisableCourt> {
    return await this.disableCourtsService.createDisableCourt(body)
  }

  @ApiUnauthorizedResponse({ description: "Must be staff to use this endpoints" })
  @ApiOkResponse({ description: "Query results", type: QueryResult })
  @UseGuards(StaffGuard)
  @Post("search")
  async getDisableCourt(@Body() data: QueryDisableCourtDTO): Promise<QueryResult> {
    return await this.disableCourtsService.queryDisableCourt(data)
  }

  @ApiUnauthorizedResponse({ description: "Must be staff to use this endpoints" })
  @UseGuards(StaffGuard)
  @Get("closed_time")
  async getClosedTime(
    @Query("sport_id") sport_id: string,
    @Query("court_num") court_num: number,
    @Query("date") dateString: string
  ): Promise<Array<number>> {
    return await this.disableCourtsService.findClosedTimes(sport_id, court_num, new Date(dateString))
  }

  @ApiUnauthorizedResponse({ description: "Must be admin to use this endpoints" })
  @ApiNotFoundResponse({ description: "Can't find disable court with specified id" })
  @ApiOkResponse({ description: "The Disable court data", type: DisableCourtDTO })
  @UseGuards(StaffGuard)
  @Get(":id")
  async getDisableCourtById(@Param("id") id: string): Promise<DisableCourt> {
    return await this.disableCourtsService.getDisableCourt(id)
  }

  @ApiUnauthorizedResponse({ description: "Must be admin to use this endpoints" })
  @ApiNotFoundResponse({ description: "Can't find disable court with specified id" })
  @ApiOkResponse({ description: "Deleted the disable court" })
  @UseGuards(AdminGuard)
  @Delete(":id")
  async deleteDisableCourtById(@Param("id") id: string): Promise<void> {
    await this.disableCourtsService.deleteDisableCourtById(id)
  }

  @ApiUnauthorizedResponse({ description: "Must be admin to use this endpoints" })
  @ApiOkResponse({ description: "Deleted the disable courts" })
  @UseGuards(AdminGuard)
  @Delete()
  async deleteDisableCourt(@Body() filter: DeleteDisableCourtDTO): Promise<void> {
    await this.disableCourtsService.deleteDisableCourt(filter)
  }

  @ApiUnauthorizedResponse({ description: "Must be admin to use this endpoints" })
  @ApiNotFoundResponse({ description: "Can't find disable court with specified id" })
  @ApiConflictResponse({ description: "Can't edit a disable court because there are some overlapping time/reservations" })
  @ApiOkResponse({ description: "Edited the disable court, return the updated disable court", type: DisableCourtDTO })
  @UseGuards(AdminGuard)
  @Put(":id")
  async editDisableCourt(@Param("id") id: string, @Body() body: EditDisableCourtDTO): Promise<DisableCourt> {
    return await this.disableCourtsService.editDisableCourt(id, body)
  }
}
