import { SettingDTO, SportDTO } from "./dto/courts.dto"
import { Injectable, HttpException, HttpStatus, BadRequestException, ConflictException, NotFoundException } from "@nestjs/common"
import { Court, Sport } from "./interfaces/sportCourt.interface"
import { Setting } from "./interfaces/setting.interface"
import { Model, isValidObjectId } from "mongoose"
import { InjectModel } from "@nestjs/mongoose"
import { DisableCourtsService } from "src/courts/disable-courts/disable-courts.service"
import { AllReservationService } from "src/reservation/all-reservation/all-reservation.service"
import { AllWaitingRoomService } from "src/reservation/all-waiting-room/all-waiting-room.service"
import { DisableCourt } from "src/courts/disable-courts/interfaces/disable-courts.interface"

@Injectable()
export class CourtManagerService {
  constructor(
    @InjectModel("Sport") private Sport: Model<Sport>,
    @InjectModel("Courts") private Court: Model<Court>,
    @InjectModel("Setting") private Setting: Model<Setting>,
    private readonly allReservationService: AllReservationService,
    private readonly allWaitingRoomService: AllWaitingRoomService,
    private readonly disableCourtsService: DisableCourtsService
  ) {}

  //might get deleted, no error handling
  async writeSetting(): Promise<Setting> {
    const setting = {
      // fix it's id to prevent creating multiple documents
      _id: "000000000000000000000000",
      waiting_room_duration: 15,
      late_cancelation_punishment: 30,
      absence_punishment: 30,
      late_cancelation_day: 2,
    }
    const court_setting = new this.Setting(setting)
    return court_setting.save()
  }

  async updateSetting(new_setting: SettingDTO): Promise<Setting> {
    if (
      (new_setting.waiting_room_duration || new_setting.late_cancelation_day || new_setting.absence_punishment || new_setting.late_cancelation_day) <=
      0
    )
      throw new HttpException("Waiting room duration must be more than 0.", HttpStatus.BAD_REQUEST)
    return await this.Setting.findOneAndUpdate({}, new_setting, { new: true })
  }

  async getSetting(): Promise<Setting> {
    const setting = await this.Setting.findOne({})
    if (setting) {
      return setting
    } else {
      return await this.writeSetting()
    }
  }

  async findSportByID(id: string): Promise<Sport> {
    if (!isValidObjectId(id)) {
      throw new HttpException(
        {
          reason: "INVALID_ID",
          message: "Invalid object id",
        },
        HttpStatus.BAD_REQUEST
      )
    }
    const doc = await this.Sport.findById(id)
    if (!doc) {
      throw new HttpException(
        {
          reason: "SPORT_NOT_FOUND",
          message: "This sport does not exist",
        },
        HttpStatus.NOT_FOUND
      )
    }
    return doc
  }

  //create sport by Sport (schema)
  async createSport(court_data: SportDTO): Promise<Sport> {
    if (court_data.required_user < 1) {
      throw new BadRequestException({
        reason: "INVALID_REQUIRED_USER",
        message: "Required user must be at least 1.",
      })
    }
    if (court_data.quota < 0 || court_data.quota > 23) {
      throw new BadRequestException({
        reason: "INVALID_QUOTA_AMOUNT",
        message: "Quota must be between 1 and 23 (inclusive).",
      })
    }

    const doc = await this.Sport.findOne({ $or: [{ sport_name_th: court_data.sport_name_th }, { sport_name_en: court_data.sport_name_en }] })

    if (doc)
      throw new BadRequestException({
        reason: "DUPLICATE_SPORT",
        message: "This Sport already exist.",
      })

    const setTime = new this.Sport(court_data)
    return setTime.save()
  }

  //update only sport setting, not court's setting
  async updateSport(
    sportID: string,
    newSportSetting: { sport_name_th: string; sport_name_en: string; required_user: number; quota: number }
  ): Promise<Sport> {
    if (newSportSetting.required_user < 1) {
      throw new BadRequestException({
        reason: "INVALID_REQUIRED_USER",
        message: "Required user must be at least 1.",
      })
    }
    if (newSportSetting.quota < 0 || newSportSetting.quota > 23) {
      throw new BadRequestException({
        reason: "INVALID_QUOTA_AMOUNT",
        message: "Quota must be between 1 and 23 (inclusive).",
      })
    }

    const sport = await this.findSportByID(sportID)
    if (!sport) {
      throw new NotFoundException({
        reason: "SPORT_NOT_FOUND",
        message: "Quota must be between 1 and 23 (inclusive).",
      })
    }
    sport.required_user = newSportSetting.required_user
    sport.quota = newSportSetting.quota

    return await sport.save()
  }

  //delete sport by its _id
  async deleteSport(sportID: string): Promise<Sport> {
    if (!isValidObjectId(sportID)) {
      throw new HttpException("Invalid Id.", HttpStatus.BAD_REQUEST)
    }

    const overlapDisableCourts = (await this.disableCourtsService.queryDisableCourt({ lean: true, sport_id: sportID })).sliced_results
    const overlapWaitingRooms = await this.allWaitingRoomService.queryWaitingRoom({ sport_id: sportID })
    const overlapReservations = await this.allReservationService.queryReservation({ sport_id: sportID })

    if (overlapDisableCourts.length != 0 || overlapWaitingRooms.length != 0 || overlapReservations.length != 0) {
      throw new ConflictException({
        statusCode: HttpStatus.CONFLICT,
        message: "There are some conflicts",
        overlapWaitingRooms,
        overlapReservations,
        overlapDisableCourts,
      })
    }

    const deleted_sport = await this.Sport.findByIdAndDelete(sportID)
    if (!deleted_sport) {
      throw new HttpException("No document for this sport.", HttpStatus.BAD_REQUEST)
    }
    return deleted_sport
  }

  async sportRegexQuery(start: number, end: number, filter: string): Promise<{ allSport_length: number; sport_list: Sport[] }> {
    if (start < 0 || end < start) {
      throw new HttpException("Invalid start or end number.", HttpStatus.BAD_REQUEST)
    }

    const listDoc = await this.Sport.find({ sport_name_th: new RegExp(filter, "i") }) //to get all, enter sport_list: ""
    const allSportLength = listDoc.length //every sports in a query (not yet sliced)

    if (end >= listDoc.length) {
      end = listDoc.length
    }
    return { allSport_length: allSportLength, sport_list: listDoc.slice(start, end) }
  }

  private range = (start, stop) => Array.from({ length: stop - start + 1 }, (_, i) => start + i)
  //update a court by court number and its data
  async updateCourtbyID(sportID: string, newSettings: Court[]): Promise<Sport> {
    //check court time slot (1-48)
    newSettings.forEach((eachSetting) => {
      if (eachSetting.open_time < 1 || eachSetting.close_time > 23) {
        throw new HttpException("Time slot is between 1 and 23.", HttpStatus.BAD_REQUEST)
      }
      if (eachSetting.open_time > eachSetting.close_time) {
        throw new HttpException("Open time cannot be more than close time.", HttpStatus.BAD_REQUEST)
      }
    })
    const doc = await this.findSportByID(sportID)
    const [deletedCourts, tighterTime] = this.findChangedCourts(doc.list_court, newSettings)
    const overlapDisableCourts: DisableCourt[] = []
    for (const court_num of deletedCourts) {
      const overlap = await this.disableCourtsService.queryDisableCourt({ lean: true, sport_id: sportID, court_num })
      overlapDisableCourts.push(...overlap.sliced_results)
    }

    const [waitingRoomFilter, reservationFilter] = this.makeFilter(sportID, deletedCourts, tighterTime)
    const overlapWaitingRooms = await this.allWaitingRoomService.queryWaitingRoom(waitingRoomFilter)
    const overlapReservations = await this.allReservationService.queryReservation(reservationFilter)

    if (overlapDisableCourts.length != 0 || overlapWaitingRooms.length != 0 || overlapReservations.length != 0) {
      throw new ConflictException({
        statusCode: HttpStatus.CONFLICT,
        message: "There are some conflicts",
        overlapWaitingRooms,
        overlapReservations,
        overlapDisableCourts,
      })
    }

    doc.list_court = newSettings
    return await doc.save()
  }

  private makeFilter(sportID: string, deletedCourts: number[], tighterTime: TighterTime[]) {
    const waitingRoomFilter = { sport_id: sportID, $or: [] }
    const reservationFilter = { sport_id: sportID, $or: [] }

    waitingRoomFilter.$or.push({ court_number: { $in: deletedCourts } })
    reservationFilter.$or.push({ court_number: { $in: deletedCourts } })

    tighterTime.forEach((court) => {
      const deletedTimeslots = this.range(court.old[0], court.new[0] - 1)
      deletedTimeslots.push(...this.range(court.new[1] + 1, court.old[1]))
      const filter = {
        court_number: court.court_num,
        time_slot: { $elemMatch: { $in: deletedTimeslots } },
      }
      waitingRoomFilter.$or.push(filter)
      reservationFilter.$or.push(filter)
    })

    return [waitingRoomFilter, reservationFilter]
  }

  async findAllSport(): Promise<Sport[]> {
    return await this.Sport.find({})
  }

  private findChangedCourts(list_court: Court[], new_list_court: Court[]): [number[], TighterTime[]] {
    const deleted: number[] = []
    const tighterTime: TighterTime[] = []

    for (const court of list_court) {
      const index = new_list_court.findIndex((c) => court.court_num == c.court_num)
      if (index == -1) {
        deleted.push(court.court_num)
        continue
      }

      const newCourt = new_list_court[index]
      if (newCourt.open_time > court.open_time || newCourt.close_time < court.close_time)
        tighterTime.push({
          court_num: court.court_num,
          old: [court.open_time, court.close_time],
          new: [newCourt.open_time, newCourt.close_time],
        })
    }

    return [deleted, tighterTime]
  }
}

interface TighterTime {
  court_num: number
  old: [number, number]
  new: [number, number]
}
;[]
