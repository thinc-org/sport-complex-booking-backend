import { HttpException, HttpStatus, Injectable } from "@nestjs/common"
import { InjectModel } from "@nestjs/mongoose"
import { Model, Types } from "mongoose"
import { Cron } from "@nestjs/schedule"

import { DisableCourtsService } from "src/courts/disable-courts/disable-courts.service"
import { Account, CuStudentUser, OtherUser, User, Verification } from "src/users/interfaces/user.interface"
import { WaitingRoomDto } from "./dto/waiting-room.dto"
import { Reservation, WaitingRoom } from "./interfaces/reservation.interface"
import { CourtManagerService } from "src/court-manager/court-manager.service"

@Injectable()
export class ReservationService {
  constructor(
    @InjectModel("WaitingRoom") private waitingRoomModel: Model<WaitingRoom>,
    @InjectModel("Reservation") private reservationModel: Model<Reservation>,
    @InjectModel("User") private userModel: Model<User>,
    private disableCourtService: DisableCourtsService,
    private courtManagerService: CourtManagerService
  ) {}

  @Cron("0 */30 * * * *")
  async checkReservation() {
    const date = new Date()
    date.setHours(date.getHours() + 7)
    const time = date.getUTCHours() + date.getMinutes() / 60
    date.setUTCHours(0, 0, 0, 0)
    const reservations = await this.reservationModel.find({ date: date })
    for (const reservation of reservations) {
      const max = Math.max(...reservation.time_slot)
      if (time >= max / 2) {
        if (reservation.is_check) {
          await reservation.remove()
        } else {
          for (const member of reservation.list_member) {
            const user = await this.userModel.findById(member)
            user.is_penalize = true
            const bannedDate = new Date()
            const bannedDay = (await this.courtManagerService.getSetting()).absence_punishment
            bannedDate.setDate(bannedDate.getDate() + bannedDay)
            user.expired_penalize_date = bannedDate
            user.save()
          }
          await reservation.remove()
        }
      }
    }
  }

  async checkValidity(id: string): Promise<boolean> {
    const user = await this.userModel.findById(id)
    if (user.account_type == Account.Other) {
      const otherUser = user as OtherUser
      const date = new Date()
      if (otherUser.verification_status != Verification.Verified) {
        throw new HttpException(
          {
            reason: "NOT_VERIFIED",
            message: "Your account has to verify first",
          },
          HttpStatus.FORBIDDEN
        )
      } else if (otherUser.account_expiration_date < date) {
        throw new HttpException(
          {
            reason: "ACCOUNT_EXPIRED",
            message: "Your account has already expired, please contact staff",
          },
          HttpStatus.FORBIDDEN
        )
      }
    }
    if (user.account_type == Account.CuStudent) {
      const cuUser = user as CuStudentUser
      if (cuUser.is_first_login) {
        throw new HttpException(
          {
            reason: "INFO_NOT_FILLED",
            message: "You have to fill your info first",
          },
          HttpStatus.UNAUTHORIZED
        )
      }
    }
    if (user.is_penalize) {
      const date = new Date()
      if (user.expired_penalize_date < date) {
        user.is_penalize = false
        user.save()
      } else {
        throw new HttpException(
          {
            reason: "BANNED",
            message: "Your account has been banned, please contact staff",
          },
          HttpStatus.FORBIDDEN
        )
      }
    }
    const haveWaitingRoom = await this.waitingRoomModel.findOne({ list_member: { $in: [Types.ObjectId(id)] } })
    if (haveWaitingRoom) {
      throw new HttpException(
        {
          reason: "DUPLICATE_ROOM",
          message: "You already have waiting room",
        },
        HttpStatus.CONFLICT
      )
    }
    return true
  }

  async checkTimeSlot(waitingRoomDto: WaitingRoomDto): Promise<number[]> {
    const date = new Date()
    date.setHours(date.getHours() + 7)
    const currentTime = date.getUTCHours() + date.getMinutes() / 60 + date.getSeconds() / 3600
    const currentTimeSlot = Math.ceil(currentTime * 2)
    date.setUTCHours(0, 0, 0, 0)
    const waitingRoomDate = new Date(waitingRoomDto.date)
    if (waitingRoomDate < date) {
      throw new HttpException(
        {
          reason: "INVALID_DATE",
          message: "You cannot reserve the past date",
        },
        HttpStatus.BAD_REQUEST
      )
    }
    date.setDate(date.getDate() + 7)
    if (waitingRoomDate > date) {
      throw new HttpException(
        {
          reason: "INVALID_DATE",
          message: "You cannot reserve the time in advance over 7 days",
        },
        HttpStatus.BAD_REQUEST
      )
    }
    date.setDate(date.getDate() - 7)
    const sport = await this.courtManagerService.findSportByID(waitingRoomDto.sport_id.toString())
    const court = sport.list_court.find((court) => court.court_num == waitingRoomDto.court_number)
    if (!court) {
      throw new HttpException(
        {
          reason: "COURT_NOT_FOUND",
          message: "This court does not exist",
        },
        HttpStatus.NOT_FOUND
      )
    }
    let open_time: number = court.open_time
    const close_time = court.close_time
    const availableTime = new Set<number>()
    if (waitingRoomDate.getTime() === date.getTime() && currentTimeSlot + 1 > open_time) {
      open_time = currentTimeSlot + 1
    }
    for (let i = open_time; i <= close_time; i++) {
      availableTime.add(i)
    }
    const reservations = await this.reservationModel.find({
      court_number: waitingRoomDto.court_number,
      date: waitingRoomDto.date,
      sport_id: waitingRoomDto.sport_id,
    })
    const waitingRooms = await this.waitingRoomModel.find({
      court_number: waitingRoomDto.court_number,
      date: waitingRoomDto.date,
      sport_id: waitingRoomDto.sport_id,
    })
    for (const reservation of reservations) {
      for (const timeSlot of reservation.time_slot) {
        availableTime.delete(timeSlot)
      }
    }
    for (const waitingRoom of waitingRooms) {
      for (const timeSlot of waitingRoom.time_slot) {
        availableTime.delete(timeSlot)
      }
    }
    const disable_times = await this.disableCourtService.findClosedTimes(
      waitingRoomDto.sport_id.toString(),
      waitingRoomDto.court_number,
      new Date(waitingRoomDto.date)
    )
    for (const disable_time of disable_times) {
      availableTime.delete(disable_time)
    }
    return Array.from(availableTime)
  }

  makeid(length): string {
    let result = ""
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
    const charactersLength = characters.length
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength))
    }
    return result
  }

  async createWaitingRoom(waitingRoomDto: WaitingRoomDto, id: string): Promise<WaitingRoom> {
    //to eliminate duplicate time slot
    const timeSlot = new Set<number>(waitingRoomDto.time_slot)
    waitingRoomDto.time_slot = Array.from(timeSlot)

    //to make sure that time slot is consecutive
    if (Math.max(...waitingRoomDto.time_slot) - Math.min(...waitingRoomDto.time_slot) + 1 !== waitingRoomDto.time_slot.length) {
      throw new HttpException(
        {
          reason: "TIME_NOT_CONSECUTIVE",
          message: "Your time slots have to be consecutive",
        },
        HttpStatus.BAD_REQUEST
      )
    }

    const availableTime = await this.checkTimeSlot(waitingRoomDto)
    if ((await this.checkQuota(waitingRoomDto, id)) < waitingRoomDto.time_slot.length) {
      throw new HttpException(
        {
          reason: "NOT_ENOUGH_QUOTA",
          message: "You do not have enough quotas",
        },
        HttpStatus.UNAUTHORIZED
      )
    }
    for (const timeSlot of waitingRoomDto.time_slot) {
      if (!availableTime.includes(timeSlot)) {
        throw new HttpException(
          {
            reason: "SLOT_UNAVAILABLE",
            message: "Your chosen time is unavailable",
          },
          HttpStatus.BAD_REQUEST
        )
      }
    }
    const waitingroom = new this.waitingRoomModel(waitingRoomDto)
    waitingroom.list_member.push(Types.ObjectId(id))
    const date = new Date()
    const waitingRoomDuration: number = (await this.courtManagerService.getSetting()).waiting_room_duration
    date.setMinutes(date.getMinutes() + waitingRoomDuration)
    waitingroom.expired_date = date
    let access_code: string = this.makeid(6)
    while (true) {
      const sameCode = await this.waitingRoomModel.findOne({ access_code: access_code })
      if (!sameCode) {
        break
      }
      access_code = this.makeid(6)
    }
    waitingroom.access_code = access_code
    waitingroom.day_of_week = waitingroom.date.getDay()
    return await waitingroom.save()
  }

  async joinWaitingRoom(accessCode: string, id: string): Promise<boolean> {
    const waitingroom = await this.waitingRoomModel.findOne({ access_code: accessCode })
    if (!waitingroom) {
      throw new HttpException(
        {
          reason: "WRONG_CODE",
          message: "The code is wrong",
        },
        HttpStatus.BAD_REQUEST
      )
    }
    if ((await this.checkQuota(waitingroom, id)) < waitingroom.time_slot.length) {
      throw new HttpException(
        {
          reason: "NOT_ENOUGH_QUOTA",
          message: "You do not have enough quotas",
        },
        HttpStatus.UNAUTHORIZED
      )
    }
    waitingroom.list_member.push(Types.ObjectId(id))
    const required_member = (await this.courtManagerService.findSportByID(waitingroom.sport_id.toString())).required_user
    if (waitingroom.list_member.length == required_member) {
      const reservation = new this.reservationModel({
        sport_id: waitingroom.sport_id,
        court_number: waitingroom.court_number,
        date: waitingroom.date,
        time_slot: waitingroom.time_slot,
        list_member: waitingroom.list_member,
        is_check: false,
      })
      await waitingroom.remove()
      await reservation.save()
      return true
    }
    await waitingroom.save()
    return false
  }

  async checkQuota(waitingRoomDto: WaitingRoomDto, id: string): Promise<number> {
    const date = new Date()
    date.setUTCHours(0, 0, 0, 0)
    const waitingRoomDate = new Date(waitingRoomDto.date)
    if (waitingRoomDate < date) {
      throw new HttpException(
        {
          reason: "INVALID_DATE",
          message: "You cannot reserve the past date",
        },
        HttpStatus.BAD_REQUEST
      )
    }
    date.setDate(date.getDate() + 7)
    if (waitingRoomDate > date) {
      throw new HttpException(
        {
          reason: "INVALID_DATE",
          message: "You cannot reserve the time in advance over 7 days",
        },
        HttpStatus.BAD_REQUEST
      )
    }

    let quota: number = (await this.courtManagerService.findSportByID(waitingRoomDto.sport_id.toString())).quota
    const joinedReservations = await this.reservationModel.find({
      list_member: { $in: [Types.ObjectId(id)] },
      date: waitingRoomDto.date,
      sport_id: waitingRoomDto.sport_id,
    })
    for (const joinedReservation of joinedReservations) {
      quota = quota - joinedReservation.time_slot.length
    }
    return quota
  }
}
