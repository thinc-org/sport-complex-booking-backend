import { ApiBadRequestResponse } from "@nestjs/swagger"
import { ApiOkResponse } from "@nestjs/swagger"
import { ApiTags } from "@nestjs/swagger"
import { AdminGuard } from "./../auth/jwt.guard"
import { StaffManagerService } from "./../staffs/staff-manager/staff-manager.service"
import { JwtAuthGuard, StaffGuard } from "src/auth/jwt.guard"
import { Body, Controller, Get, Post, Delete, Put, Param, UseGuards, Req, Query } from "@nestjs/common"
import { CourtManagerService } from "./court-manager.service"
import { Sport, Court } from "./interfaces/sportCourt.interface"
import { Setting } from "./interfaces/setting.interface"
import { ListAllUserService } from "./../staffs/list-all-user/list-all-user.service"
import { Role } from "src/common/roles"
import { CourtDTO, searchQueryDTO, searchResultDTO, SettingDTO, updateSportDTO, SportDTO } from "./dto/courts.dto"

interface searchQuery {
  start: number
  end: number
  filter: string
}
@ApiTags("court-manager")
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
  @ApiBadRequestResponse({ description: "Incorrect body", type: SettingDTO })
  @Put("setting")
  async updateSetting(@Body() new_setting: Setting): Promise<Setting> {
    return await this.courtManagerService.updateSetting(new_setting)
  }

  @UseGuards(JwtAuthGuard)
  @ApiOkResponse({ description: "Setting received", type: SettingDTO })
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
  @ApiOkResponse({ description: "Query successful (an array of Court)", type: searchResultDTO })
  @ApiBadRequestResponse({ description: "Incorrect search query", type: searchQueryDTO })
  @Get("/search") //    /search?start=<START>&end=<END>&filter=<FILTER>
  async getSportList(@Query() query: searchQuery): Promise<{ allSport_length: number; sport_list: Sport[] }> {
    return await this.courtManagerService.sportRegexQuery(query.start, query.end, query.filter)
  }

  @UseGuards(JwtAuthGuard)
  @ApiOkResponse({ description: "Query successful (an array of Court)", type: searchResultDTO })
  @ApiBadRequestResponse({ description: "Incorrect search query", type: searchQueryDTO })
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
  @ApiOkResponse({ description: "Query successful", type: CourtDTO })
  @ApiBadRequestResponse({ description: "Incorrect id." })
  @Get("/:id")
  async getSport(@Param("id") id: string): Promise<Sport> {
    return await this.courtManagerService.findSportByID(id)
  }

  //create new document for each sport using body as sport
  @UseGuards(AdminGuard)
  @ApiOkResponse({ description: "Sport created", type: CourtDTO })
  @ApiBadRequestResponse({ description: "Incorrect body", type: CourtDTO })
  @Post("/")
  async createSport(@Body() sport_data: Sport): Promise<Sport> {
    return await this.courtManagerService.createSport(sport_data)
  }

  //for updating sport_name_th, sport_name_en, quotas, required_users
  @UseGuards(AdminGuard)
  @ApiOkResponse({ description: "Sport updated", type: CourtDTO })
  @ApiBadRequestResponse({ description: "Incorrect body", type: CourtDTO })
  @Put("/:id")
  async updateSport(
    @Param("id") id: string,
    @Body() sport_data: { sport_name_th: string; sport_name_en: string; required_user: number; quota: number }
  ): Promise<Sport> {
    return await this.courtManagerService.updateSport(id, sport_data)
  }

  //delete sport by sport's _id
  @UseGuards(AdminGuard)
  @ApiOkResponse({ description: "Sport deleted", type: CourtDTO })
  @ApiBadRequestResponse({ description: "Incorrect body", type: CourtDTO })
  @Delete(":id")
  async deleteSport(@Param("id") id: string): Promise<Sport> {
    return await this.courtManagerService.deleteSport(id)
  }

  //Param is sportType ex. Basketball (in english)
  @UseGuards(AdminGuard)
  @ApiOkResponse({ description: "Sport created", type: SportDTO })
  @ApiBadRequestResponse({ description: "Incorrect body", type: updateSportDTO })
  @Put("court-setting/update")
  async changeCourtSetting(@Body() new_court: { sport_id: string; new_setting: Court[] }): Promise<Sport> {
    return await this.courtManagerService.updateCourtbyID(new_court.sport_id, new_court.new_setting)
  }
}
