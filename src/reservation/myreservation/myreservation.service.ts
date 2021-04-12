import { Injectable, HttpException, HttpStatus } from "@nestjs/common"
import { InjectModel } from "@nestjs/mongoose"
import { Model, Types } from "mongoose"

import { Reservation } from "./../interfaces/reservation.interface"

import { User } from "./../../users/interfaces/user.interface"

import { CourtManagerService } from "./../../court-manager/court-manager.service"
import { UsersService } from "./../../users/users.service"
import { Setting } from "./../../court-manager/interfaces/setting.interface"

@Injectable()
export class MyReservationService {
  constructor(
    @InjectModel("User") private userModel: Model<User>,
    @InjectModel("Reservation") private reservationModel: Model<Reservation>,
    private readonly courtManagerService: CourtManagerService,
    private readonly userService: UsersService
  ) {}

  async getLanguage(user_id: Types.ObjectId): Promise<boolean> {
    return (await this.userService.findById(user_id)).is_thai_language
  }

  async getAllMyReservation(user_id: Types.ObjectId): Promise<Reservation[]> {
    const reservation: Reservation[] = await this.reservationModel
      .find({ list_member: user_id })
      .sort({ sport_id: 1, date: 1, time_slot: -1, is_check: 1 })
      .populate("sport_id", "sport_name_th sport_name_en")
      .populate("list_member", "name_en surname_en name_th surname_th")
      .select("sport_id court_number date day_of_week time_slot is_check")
    return reservation
  }

  async getById(userId: Types.ObjectId, reservationId: Types.ObjectId): Promise<Reservation> {
    const reservation: Reservation = await this.reservationModel
      .findById(reservationId)
      .populate("sport_id", "sport_name_th sport_name_en")
      .populate("list_member", "name_en surname_en name_th surname_th")

    if (reservation === null) {
      throw new HttpException("This reservation doesn't exist.", HttpStatus.NOT_FOUND)
    }

    for (const user of reservation.toJSON().list_member) {
      if (user._id.toString() === userId.toString()) {
        return reservation
      }
    }

    throw new HttpException("This userId isn't authorized.", HttpStatus.UNAUTHORIZED)
  }

  async cancelMyReservation(user_id: Types.ObjectId, reservationId: Types.ObjectId): Promise<Reservation> {
    const reservation: Reservation = await this.reservationModel.findById(reservationId)

    if (reservation === null) {
      throw new HttpException("This reservation doesn't exist.", HttpStatus.NOT_FOUND)
    }
    if (!reservation.list_member.includes(user_id)) {
      throw new HttpException("This user isn't in the reservation.", HttpStatus.UNAUTHORIZED)
    }

    const currentTime: Date = new Date()
    currentTime.setHours(currentTime.getHours() + 7)
    const reservedTime: Date = reservation.date
    reservedTime.setHours(reservation.time_slot[0] - 1)
    const diffTime = reservedTime.getTime() - currentTime.getTime()
    const diffHour = diffTime / 3600000 // 3600000 ms = 1 hr
    const diffMinute = diffTime / 60000 // 60000 ms = 1 minute

    if (diffMinute <= 120) {
      throw new HttpException("Cancelling before 2 hour the reserved time is not allow.", HttpStatus.FORBIDDEN)
    }

    reservation.remove()

    const setting: Setting = await this.courtManagerService.getSetting()
    const lateCancelationPunishment: number = setting.late_cancelation_punishment,
      lateCancelationHour: number = setting.late_cancelation_day * 24

    if (diffHour < lateCancelationHour) {
      for (const userid of reservation.list_member) {
        const newExpiredPenalizeDate = new Date()
        newExpiredPenalizeDate.setDate(newExpiredPenalizeDate.getDate() + lateCancelationPunishment)
        await this.userModel.findByIdAndUpdate(userid, { is_penalize: true, expired_penalize_date: newExpiredPenalizeDate })
      }
    }

    return reservation
  }

  async checkReservation(reservationId: Types.ObjectId): Promise<Reservation> {
    const reservation: Reservation = await this.reservationModel
      .findById(reservationId)
      .populate("sport_id", "sport_name_th sport_name_en")
      .select("is_check sport_id date time_slot")

    if (reservation === null) {
      throw new HttpException("Invalid reservation.", HttpStatus.NOT_FOUND)
    }

    const currentTime: Date = new Date()
    currentTime.setHours(currentTime.getHours() + 7)
    const reservedTime: Date = reservation.date
    reservedTime.setHours(reservation.time_slot[0] - 1)
    const diffTime = reservedTime.getTime() - currentTime.getTime()
    const diffMinute = diffTime / 60000

    if (diffMinute > 60) {
      throw new HttpException("Can only check-in within one hour before the reservation time", HttpStatus.FORBIDDEN)
    }

    const previousIsCheck = reservation.is_check
    reservation.is_check = true
    reservation.save()
    reservation.is_check = previousIsCheck

    return reservation
  }
}
