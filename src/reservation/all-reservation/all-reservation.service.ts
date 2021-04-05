import { Injectable, HttpException, HttpStatus } from "@nestjs/common"
import { InjectModel } from "@nestjs/mongoose"
import { Model } from "mongoose"
import { Reservation } from "src/reservation/interfaces/reservation.interface"
import { DisableCourt } from "src/courts/disable-courts/interfaces/disable-courts.interface"

@Injectable()
export class AllReservationService {
  constructor(@InjectModel("Reservation") private readonly reservationModel: Model<Reservation>) {}

  async getReservation(id: string): Promise<Reservation> {
    const reservation = await this.reservationModel
      .findById(id)
      .populate("list_member", "username personal_email phone")
      .exec()
    if (!reservation) throw new HttpException("Reservation not found", HttpStatus.NOT_FOUND)
    return reservation
  }

  async getReservationSearchResult(body): Promise<[number, Reservation[]]> {
    let reservation = this.reservationModel
      .find()
      .sort({ date: 1, time_slot: -1 })
      .populate("list_member", "username personal_email phone")
    if (body.sportId) {
      reservation = reservation.find({ sport_id: body.sportId })
      if (body.courtNumber) reservation = reservation.find({ court_number: body.courtNumber })
    }

    if (body.date) {
      body.date = new Date(body.date)
      const nextDate = new Date(body.date)
      nextDate.setDate(body.date.getDate() + 1)
      reservation = reservation.find({ date: { $gte: body.date, $lt: nextDate } })
    }

    if (body.timeSlot) reservation = reservation.find({ time_slot: { $elemMatch: { $in: body.timeSlot } } })

    let result: Reservation[] = await reservation
    const length = result.length
    if (body.start) {
      body.start = Number(body.start)
      if (!body.end) result = result.slice(body.start)
      else {
        body.end = Number(body.end)
        result = result.slice(body.start, body.end)
      }
    }
    return [length, result]
  }
  async deleteReservation(id: string): Promise<Reservation> {
    const reservation = this.reservationModel.findByIdAndRemove(id)
    if (!reservation) throw new HttpException("Reservation not found", HttpStatus.NOT_FOUND)
    return reservation
  }

  async findOverlapReservation(disableCourt: DisableCourt): Promise<Reservation[]> {
    const queryArray = []
    for (const distime of disableCourt.disable_time) {
      queryArray.push({ time_slot: { $elemMatch: { $in: distime.time_slot } }, day_of_week: distime.day })
    }

    const reservation = await this.reservationModel
      .find({
        sport_id: disableCourt.sport_id,
        court_number: disableCourt.court_num,
        date: { $gte: disableCourt.starting_date, $lt: disableCourt.expired_date },
        $or: queryArray,
      })
      .sort({ date: 1, time_slot: -1 })
      .populate("list_member", "username personal_email phone name_en surname_en name_th surname_th")
    return reservation
  }

  public async queryReservation(filter) {
    return await this.reservationModel.find(filter).populate("list_member", "username personal_email phone name_en surname_en name_th surname_th")
  }
}
