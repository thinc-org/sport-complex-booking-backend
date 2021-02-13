import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards, UsePipes, ValidationPipe } from "@nestjs/common"
import { ApiBearerAuth, ApiBody, ApiConflictResponse, ApiNotFoundResponse, ApiOkResponse, ApiTags, ApiUnauthorizedResponse } from "@nestjs/swagger"
import { AdminGuard, StaffGuard } from "src/auth/jwt.guard"
import { CreateDisableCourtDTO, DisableCourtDTO, EditDisableCourtDTO, QueryDisableCourtDTO, QueryResult } from "./disable-courts.dto"
import { DisableCourtsService } from "./disable-courts.service"
import { DisableCourt } from "./interfaces/disable-courts.interface"

@ApiTags("disable-court")
@ApiBearerAuth()
@ApiUnauthorizedResponse({ description: "Must be admin to use this endpoints" })
@UsePipes(new ValidationPipe({ transform: true }))
@UseGuards(AdminGuard)
@Controller("courts/disable-courts")
export class DisableCourtsController {
  constructor(private readonly disableCourtsService: DisableCourtsService) {}

  @ApiConflictResponse({ description: "Can't create a disable court because there are some overlapping time/reservations" })
  @ApiOkResponse({ description: "Created a disable court", type: DisableCourtDTO })
  @Post("")
  async createDisableCourt(@Body() body: CreateDisableCourtDTO): Promise<DisableCourt> {
    return await this.disableCourtsService.createDisableCourt(body)
  }

  @ApiOkResponse({ description: "Query results", type: QueryResult })
  @Post("/search")
  async getDisableCourt(@Body() data: QueryDisableCourtDTO): Promise<QueryResult> {
    return await this.disableCourtsService.queryDisableCourt(data)
  }

  @Get("closed_time")
  async getClosedTime(
    @Query("sport_id") sport_id: string,
    @Query("court_num") court_num: number,
    @Query("date") dateString: string
  ): Promise<Array<number>> {
    return await this.disableCourtsService.findClosedTimes(sport_id, court_num, new Date(dateString))
  }

  @ApiNotFoundResponse({ description: "Can't find disable court with specified id" })
  @ApiOkResponse({ description: "The Disable court data", type: DisableCourtDTO })
  @Get(":id")
  async getDisableCourtById(@Param("id") id: string): Promise<DisableCourt> {
    return await this.disableCourtsService.getDisableCourt(id)
  }

  @ApiOkResponse({ description: "Deleted all disable courts" })
  @Delete("")
  async deleteAllDisableCourt(): Promise<void> {
    await this.disableCourtsService.deleteAllDisableCourt()
  }

  @ApiNotFoundResponse({ description: "Can't find disable court with specified id" })
  @ApiOkResponse({ description: "Deleted the disable court" })
  @Delete(":id")
  async deleteDisableCourt(@Param("id") id: string): Promise<void> {
    await this.disableCourtsService.deleteDisableCourt(id)
  }

  @ApiNotFoundResponse({ description: "Can't find disable court with specified id" })
  @ApiConflictResponse({ description: "Can't edit a disable court because there are some overlapping time/reservations" })
  @ApiOkResponse({ description: "Edited the disable court, return the updated disable court", type: DisableCourtDTO })
  @Put(":id")
  async editDisableCourt(@Param("id") id: string, @Body() body: EditDisableCourtDTO): Promise<DisableCourt> {
    return await this.disableCourtsService.editDisableCourt(id, body)
  }
}
