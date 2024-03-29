import { HttpException, HttpStatus, Injectable } from "@nestjs/common"
import { InjectModel } from "@nestjs/mongoose"
import { Model } from "mongoose"
import { AllReservationService } from "src/reservation/all-reservation/all-reservation.service"
import { AllWaitingRoomService } from "src/reservation/all-waiting-room/all-waiting-room.service"
import { Reservation, WaitingRoom } from "src/reservation/interfaces/reservation.interface"
import { CreateDisableCourtDTO, EditDisableCourtDTO, QueryDisableCourtDTO, QueryResult } from "./disable-courts.dto"
import { DisableCourt } from "./interfaces/disable-courts.interface"

@Injectable()
export class DisableCourtsService {
  constructor(
    @InjectModel("DisableCourt") private readonly disableCourtModel: Model<DisableCourt>,
    private readonly allReservationService: AllReservationService,
    private readonly allWaitingRoomService: AllWaitingRoomService
  ) {}
  async createDisableCourt(data: CreateDisableCourtDTO): Promise<DisableCourt> {
    if (!this.verifyStartAndEndDate(data.starting_date, data.expired_date))
      throw new HttpException("starting_date cannot be after expired_date", HttpStatus.BAD_REQUEST)

    data.starting_date.setUTCHours(0, 0, 0, 0)
    data.expired_date.setUTCHours(23, 0, 0, 0)
    const disableCourt = this.disableCourtfromCreateDTO(data)

    const overlaps = await this.findOverlapDisableCourt(disableCourt)
    if (overlaps.length != 0) {
      throw new HttpException(
        {
          statusCode: HttpStatus.CONFLICT,
          message: "There are some overlapping times",
          reason: 0,
          overlaps,
        },
        HttpStatus.CONFLICT
      )
    }

    const [overlapReservations, overlapWaitingRooms] = await this.findOverlapReservationAndWaitingRoom(disableCourt)
    if (overlapReservations.length != 0 || overlapWaitingRooms.length != 0) {
      throw new HttpException(
        {
          statusCode: HttpStatus.CONFLICT,
          message: "There are some overlapping reservations/waiting rooms",
          reason: 1,
          overlapReservations,
          overlapWaitingRooms,
        },
        HttpStatus.CONFLICT
      )
    }

    return await disableCourt.save()
  }

  async queryDisableCourt(data: QueryDisableCourtDTO): Promise<QueryResult> {
    let query = this.disableCourtModel.find()

    if (data.expired_date != null) {
      data.expired_date.setUTCHours(23, 0, 0, 0)
      query = query.find({ starting_date: { $lte: data.expired_date } })
    }
    if (data.starting_date != null) {
      data.starting_date.setUTCHours(0, 0, 0, 0)
      query = query.find({ expired_date: { $gte: data.starting_date } })
    }
    if (data.sport_id != null) query = query.find({ sport_id: data.sport_id })
    if (data.court_num != null) query = query.find({ court_num: data.court_num })
    if (data.description != null) query = query.find({ description: { $regex: ".*" + data.description + ".*" } })

    if (data.lean) query.select("-disable_time")

    // populate sport_id field
    await query.populate("sport_id")

    const results = await query.sort("starting_date expired_date")

    let start = data.start ?? 0
    let end = data.end && data.end < results.length ? data.end : results.length - 1

    const sliced_results = results.slice(start, end + 1)

    return {
      total_found: results.length,
      total_returned: sliced_results.length, // included to avoid confusion with total_found
      sliced_results: sliced_results,
    }
  }

  async getDisableCourt(id: string): Promise<DisableCourt> {
    const disableCourt = await this.disableCourtModel.findById(id).populate("sport_id")
    if (disableCourt == null) throw new HttpException("Cannot find DisableCourt with id: " + id, HttpStatus.NOT_FOUND)
    return disableCourt
  }

  async deleteAllDisableCourt(): Promise<void> {
    await this.disableCourtModel.deleteMany({})
  }

  async deleteDisableCourtById(id: string): Promise<void> {
    await this.disableCourtModel.deleteOne({ _id: id })
  }

  async deleteDisableCourt(filter: QueryDisableCourtDTO): Promise<void> {
    await this.disableCourtModel.deleteMany(filter)
  }

  async editDisableCourt(id: string, data: EditDisableCourtDTO): Promise<DisableCourt> {
    let disableCourt = await this.disableCourtModel.findById(id)

    if (disableCourt == null) throw new HttpException("Cannot find DisableCourt with id: " + id, HttpStatus.NOT_FOUND)

    disableCourt = this.disableCourtfromEditDTO(disableCourt, data)

    const overlaps = await this.findOverlapDisableCourt(disableCourt)
    if (overlaps.length != 0) {
      throw new HttpException(
        {
          statusCode: HttpStatus.CONFLICT,
          message: "There are some overlapping times",
          reason: 0,
          overlaps,
        },
        HttpStatus.CONFLICT
      )
    }

    const [overlapReservations, overlapWaitingRooms] = await this.findOverlapReservationAndWaitingRoom(disableCourt)
    if (overlapReservations.length != 0 || overlapWaitingRooms.length != 0) {
      throw new HttpException(
        {
          statusCode: HttpStatus.CONFLICT,
          message: "There are some overlapping reservations/waiting rooms",
          reason: 1,
          overlapReservations,
          overlapWaitingRooms,
        },
        HttpStatus.CONFLICT
      )
    }

    if (!this.verifyStartAndEndDate(disableCourt.starting_date, disableCourt.expired_date))
      throw new HttpException("starting_date cannot be after expired_date", HttpStatus.BAD_REQUEST)

    return await disableCourt.save()
  }

  /*
        find when a court number {court_num} of {sport_id} sport closes on {date}
        return an array of tuple [start :number,end :number]
        each tuple means that the court is closed during interval [start,end]
        ex. [ [90,120], [300,330] ] means the court is closed from 90 to 120 and from 300 to 330
        
        note: 
        The resulting array isn't sorted. 
    */
  async findClosedTimes(sport_id: string, court_num: number, date: Date): Promise<Array<number>> {
    date.setUTCHours(0, 0, 0)
    const day = date.getDay()

    const results = await this.disableCourtModel
      .find({
        starting_date: { $lte: date },
        expired_date: { $gte: date },
        sport_id,
        court_num,
        disable_time: { $elemMatch: { day } },
      })
      .select("disable_time")

    const timeArr: Array<number> = []
    results.forEach((disableCourt) => {
      disableCourt.disable_time.forEach((disableTime) => {
        if (disableTime.day === day) timeArr.push(...disableTime.time_slot)
      })
    })
    return timeArr
  }

  /*
        private utility methods
    */

  private async findOverlapReservationAndWaitingRoom(disableCourt: DisableCourt): Promise<[Array<Reservation>, Array<WaitingRoom>]> {
    return [
      await this.allReservationService.findOverlapReservation(disableCourt),
      await this.allWaitingRoomService.findOverlapWaitingroom(disableCourt),
    ]
  }

  private async findOverlapDisableCourt(disableCourt: DisableCourt): Promise<Array<string>> {
    const overlaps: string[] = []
    const queryOrArray = []

    for (const disableTime of disableCourt.disable_time) {
      queryOrArray.push({ day: disableTime.day, time_slot: { $in: disableTime.time_slot } })
    }

    const results = await this.disableCourtModel
      .find({
        sport_id: disableCourt.sport_id,
        court_num: disableCourt.court_num,
        starting_date: { $lte: disableCourt.expired_date },
        expired_date: { $gte: disableCourt.starting_date },
        disable_time: { $elemMatch: { $or: queryOrArray } },
      })
      .select("_id description")
    results.forEach((dis) => {
      if (!disableCourt._id.equals(dis._id)) overlaps.push(dis.description)
    })

    return overlaps
  }

  private verifyStartAndEndDate(startDate: Date, endDate: Date): boolean {
    if (startDate == null && endDate == null) return true
    else return startDate <= endDate
  }

  private disableCourtfromEditDTO(disableCourt: DisableCourt, data: EditDisableCourtDTO): DisableCourt {
    if (data.description != null) disableCourt.description = data.description
    if (data.sport_id != null) disableCourt.sport_id = data.sport_id
    if (data.court_num != null) disableCourt.court_num = data.court_num
    if (data.starting_date != null) {
      disableCourt.starting_date = data.starting_date
      disableCourt.starting_date.setUTCHours(0, 0, 0, 0)
    }
    if (data.expired_date != null) {
      disableCourt.expired_date = data.expired_date
      disableCourt.expired_date.setUTCHours(23, 0, 0, 0)
    }
    if (data.disable_time != null) disableCourt.disable_time = data.disable_time
    return disableCourt
  }

  private disableCourtfromCreateDTO(data: CreateDisableCourtDTO): DisableCourt {
    const disableCourt = new this.disableCourtModel()
    disableCourt.description = data.description
    disableCourt.sport_id = data.sport_id
    disableCourt.starting_date = data.starting_date
    disableCourt.expired_date = data.expired_date
    disableCourt.court_num = data.court_num
    disableCourt.disable_time = data.disable_time
    return disableCourt
  }
}
