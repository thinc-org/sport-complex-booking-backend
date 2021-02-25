import { ApiOkResponse, ApiBadRequestResponse, ApiBearerAuth, ApiUnauthorizedResponse, ApiNotFoundResponse } from "@nestjs/swagger"
import { ApiTags } from "@nestjs/swagger"
import { StaffManagerService } from "./../staffs/staff-manager/staff-manager.service"
import { UserGuard, AdminGuard } from "src/auth/jwt.guard"
import { Body, Controller, Get, Post, Delete, Put, Param, UseGuards, Req, Query } from "@nestjs/common"
import { CourtManagerService } from "./court-manager.service"
import { Sport } from "./interfaces/sportCourt.interface"
import { Setting } from "./interfaces/setting.interface"
import { ListAllUserService } from "./../staffs/list-all-user/list-all-user.service"
import { Role } from "src/common/roles"
import { SearchQueryDTO, SearchSportResultDTO, SettingDTO, UpdateSportDTO, SportDTO } from "./dto/courts.dto"

@ApiTags("court-manager")
@ApiBearerAuth()
@Controller("court-manager")
export class CourtManagerController {
  constructor(
    private readonly courtManagerService: CourtManagerService,
    private readonly listAllUserService: ListAllUserService,
    private readonly staffManagerService: StaffManagerService
  ) {}

  //might get deleted, no error handling
  @UseGuards(AdminGuard)
  @Post("setting")
  async postSetting(): Promise<Setting> {
    return await this.courtManagerService.writeSetting()
  }

  @UseGuards(AdminGuard)
  @ApiOkResponse({ description: "Setting updated", type: SettingDTO })
  @ApiBadRequestResponse({
    description: "waiting_room_duration, late_cancelation_day. absence_punishment, late_cancelation_day must be more than zero.",
  })
  @ApiUnauthorizedResponse({ description: "Must be admin to use this endpoints" })
  @Put("setting")
  async updateSetting(@Body() new_setting: SettingDTO): Promise<Setting> {
    return await this.courtManagerService.updateSetting(new_setting)
  }

  @UseGuards(UserGuard)
  @ApiOkResponse({ description: "Setting received", type: SettingDTO })
  @ApiUnauthorizedResponse({ description: "Must be user to use this endpoint" })
  @Get("setting")
  async getSetting(@Req() req): Promise<Setting> {
    if (!(req.user.role == Role.Admin || req.user.role == Role.Staff) === false) {
      this.listAllUserService.getUserById(req.user.userId) //err handled in the function
    } else {
      this.staffManagerService.getStaffData(req.user.userId) //err handled in the function
    }
    return await this.courtManagerService.getSetting()
  }

  //Get sport by thai name (regex)
  //if no filter, use $ as param for filter

  @UseGuards(AdminGuard)
  @ApiOkResponse({ description: "Query successful (a list of Sport)", type: SearchSportResultDTO })
  @ApiBadRequestResponse({ description: "Incorrect search query" })
  @ApiUnauthorizedResponse({ description: "Must be admin to use this endpoint" })
  @Get("/search") //    /search?start=<START>&end=<END>&filter=<FILTER>
  async getSportList(@Query() query: SearchQueryDTO): Promise<{ allSport_length: number; sport_list: Sport[] }> {
    return await this.courtManagerService.sportRegexQuery(query.start, query.end, query.filter)
  }

  @UseGuards(UserGuard)
  @ApiOkResponse({ description: "Query successful (a list of every Sport)", type: SearchSportResultDTO })
  @ApiUnauthorizedResponse({ description: "Must be user to use this endpoints" })
  @Get("/sports")
  async getAllSportList(@Req() req): Promise<Sport[]> {
    //check if user or staff exists + error handling
    if (!(req.user.role == Role.Admin || req.user.role == Role.Staff)) {
      this.listAllUserService.getUserById(req.user.userId) //err handled in the function
    } else {
      this.staffManagerService.getStaffData(req.user.userId) //err handled in the function
    }
    return await this.courtManagerService.findAllSport()
  }

  //can be use for courts displaying
  @UseGuards(AdminGuard)
  @ApiOkResponse({ description: "Query successful", type: SportDTO })
  @ApiBadRequestResponse({ description: "Invalid object id." })
  @ApiUnauthorizedResponse({ description: "Must be admin to use this endpoints" })
  @ApiNotFoundResponse({ description: "Can't find sport with specified id" })
  @Get("/:id")
  async getSport(@Param("id") id: string): Promise<Sport> {
    return await this.courtManagerService.findSportByID(id)
  }

  //create new document for each sport using body as sport
  @UseGuards(AdminGuard)
  @ApiOkResponse({ description: "Sport created", type: SportDTO })
  @ApiBadRequestResponse({
    description: "Required user must be at least 2, quota must be between 1 and 23 (inclusive) or this Sport already exist.",
  })
  @ApiUnauthorizedResponse({ description: "Must be admin to use this endpoints" })
  @Post("/")
  async createSport(@Body() sport_data: SportDTO): Promise<Sport> {
    return await this.courtManagerService.createSport(sport_data)
  }

  //for updating sport_name_th, sport_name_en, quotas, required_users
  @UseGuards(AdminGuard)
  @ApiOkResponse({ description: "Sport updated", type: SportDTO })
  @ApiBadRequestResponse({ description: "Required user must be at least 2, quota must be between 1 and 23 (inclusive) or invalid object id" })
  @ApiUnauthorizedResponse({ description: "Must be admin to use this endpoints" })
  @ApiNotFoundResponse({ description: "Can't find sport with specified id" })
  @Put("/:id")
  async updateSport(@Param("id") id: string, @Body() sport_data: SportDTO): Promise<Sport> {
    return await this.courtManagerService.updateSport(id, sport_data)
  }

  //delete sport by sport's _id
  @UseGuards(AdminGuard)
  @ApiOkResponse({ description: "Sport deleted", type: SportDTO })
  @ApiBadRequestResponse({ description: "Invalid Id or no document for this sport" })
  @ApiUnauthorizedResponse({ description: "Must be admin to use this endpoints" })
  @ApiNotFoundResponse({ description: "Can't find sport with specified id" })
  @Delete(":id")
  async deleteSport(@Param("id") id: string): Promise<Sport> {
    return await this.courtManagerService.deleteSport(id)
  }

  //Param is sportType ex. Basketball (in english)
  @UseGuards(AdminGuard)
  @ApiOkResponse({ description: "Sport updated", type: SportDTO })
  @ApiBadRequestResponse({ description: "Time slot is not between 1 and 23 or open time cannot be more than close time." })
  @ApiUnauthorizedResponse({ description: "Must be admin to use this endpoints" })
  @ApiNotFoundResponse({ description: "Can't find sport with specified id" })
  @Put("court-setting/update")
  async changeCourtSetting(@Body() new_court: UpdateSportDTO): Promise<Sport> {
    return await this.courtManagerService.updateCourtbyID(new_court.sport_id, new_court.new_setting)
  }
}
