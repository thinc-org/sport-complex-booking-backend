
import { BadRequestException, HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { isValidObjectId, Model, Types } from 'mongoose';
import {  Cron } from '@nestjs/schedule';

import { DisableCourtsService } from 'src/courts/disable-courts/disable-courts.service';
import { Account, OtherUser, User, Verification } from 'src/users/interfaces/user.interface';
import { WaitingRoomDto } from './dto/waiting-room.dto';
import { Reservation, WaitingRoom } from "./interfaces/reservation.interface";


@Injectable()
export class ReservationService {
    constructor(
        @InjectModel('WaitingRoom') private waitingRoomModel: Model<WaitingRoom>,
        @InjectModel('Reservation') private reservationModel: Model<Reservation>,
        @InjectModel('User') private userModel: Model<User>,
        private disableCourtService: DisableCourtsService
    ) { }

    @Cron('0 */30 * * * *')
    async checkReservation(){
        const date = new Date()
        date.setHours(date.getHours()+7)
        const time = date.getUTCHours()*60 + date.getMinutes()/60
        date.setUTCHours(0, 0, 0, 0);
        const reservations = await this.reservationModel.find({date: date})
        for(const reservation of reservations){
            const max = Math.max.apply(Math,reservation.time_slot)
            if(time>=max/2){
                if(reservation.is_check){
                    await reservation.remove()
                }else{
                    for(const member of reservation.list_member){
                        const user = await this.userModel.findById(member)
                        user.is_penalize = true
                        const bannedDate = new Date()
                        const bannedDay = 30 //เวลาตรงนี้ต้องไปเอามาจากsetting
                        bannedDate.setDate(bannedDate.getDate() + bannedDay)
                        user.expired_penalize_date = bannedDate
                        user.save()
                        await reservation.remove()
                    }
                }
            }
        }
    }

    async checkValidity(id: string): Promise<boolean> {
        const user = await this.userModel.findById(id);
        if (user == null) {
            throw new HttpException("This Id does not exist.", HttpStatus.BAD_REQUEST)
        }
        if (user.account_type == Account.Other) {
            const otherUser = user as OtherUser
            const date = new Date();
            if (otherUser.verification_status != Verification.Verified) {
                throw new HttpException("Your account has to verify first", HttpStatus.UNAUTHORIZED)
            }
            else if (otherUser.account_expiration_date < date) {
                throw new HttpException("Your account has already expired, please contact staff", HttpStatus.UNAUTHORIZED)
            }
        }
        if (user.is_penalize) {
            const date = new Date();
            if(user.expired_penalize_date < date){
                user.is_penalize = false
                user.save()
            }else{
                throw new HttpException("Your account has been banned, please contact staff", HttpStatus.FORBIDDEN)
            }
        }
        const haveWaitingRoom = await this.waitingRoomModel.findOne({ list_member: { $in: [Types.ObjectId(id)] } })
        if (haveWaitingRoom) {
            throw new HttpException("You already have waiting room", HttpStatus.CONFLICT)
        }
        return true
    }

    async checkTimeSlot(waitingRoomDto: WaitingRoomDto): Promise<number[]>{
        const open_time = 17  //เวลาตรงนี้ต้องไปเอามาจากsetting
        const close_time = 40 //เวลาตรงนี้ต้องไปเอามาจากsetting
        const availableTime = new Set<number>()
        for (let i = open_time; i <= close_time;i++){
            availableTime.add(i)
        }
        const reservations = await this.reservationModel.find({ court_number: waitingRoomDto.court_number, date: waitingRoomDto.date, sport_id: waitingRoomDto.sport_id })
        const waitingRooms = await this.waitingRoomModel.find({ court_number: waitingRoomDto.court_number, date: waitingRoomDto.date, sport_id: waitingRoomDto.sport_id })
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
        const disable_times = await this.disableCourtService.findClosedTimes(waitingRoomDto.sport_id.toString(),waitingRoomDto.court_number,new Date(waitingRoomDto.date))
        for (const disable_time of disable_times){
            availableTime.delete(disable_time)
        }
        return Array.from(availableTime)
    }

    makeid(length): string {
        let result: string = '';
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        const charactersLength = characters.length;
        for (let i = 0; i < length; i++) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }
        return result;
    }

    async createWaitingRoom(waitingroomdto: WaitingRoomDto, id: string): Promise<WaitingRoom> {
        const availableTime = await this.checkTimeSlot(waitingroomdto)
        if(await this.checkQuota(waitingroomdto,id)<waitingroomdto.time_slot.length){
            throw new HttpException("You have not enough quotas", HttpStatus.UNAUTHORIZED)
        }
        for(const timeSlot of waitingroomdto.time_slot){
            if(!availableTime.includes(timeSlot)){
                throw new HttpException("Your choosed time is unavailable", HttpStatus.UNAUTHORIZED)
            }
        }
        const waitingroom = new this.waitingRoomModel(waitingroomdto)
        waitingroom.list_member.push(Types.ObjectId(id))
        const date = new Date();
        const waitingRoomDuration: number = 1 //เวลาตรงนี้ต้องไปเอามาจากsetting
        date.setMinutes(date.getMinutes() + waitingRoomDuration)
        waitingroom.expired_date = date
        let access_code: string = this.makeid(6);
        while (true) {
            const sameCode = await this.waitingRoomModel.findOne({ access_code: access_code })
            if (!sameCode) {
                break
            }
            access_code = this.makeid(6);
        }
        waitingroom.access_code = access_code
        waitingroom.day_of_week = waitingroom.date.getDay()
        return await waitingroom.save()
    }

    async joinWaitingRoom(access_code: string, id: string): Promise<boolean> {
        const waitingroom = await this.waitingRoomModel.findOne({ access_code: access_code })
        if (!waitingroom) {
            throw new HttpException("The code is wrong.", HttpStatus.BAD_REQUEST)
        }
        if(await this.checkQuota(waitingroom,id) < waitingroom.time_slot.length){
            throw new HttpException("You have not enough quotas", HttpStatus.UNAUTHORIZED)
        }
        waitingroom.list_member.push(Types.ObjectId(id))
        const required_member = 2 //เลขตรงนี้ต้องไปเอามาจากsport
        if (waitingroom.list_member.length == required_member) {
            const reservation = new this.reservationModel({
                sport_id: waitingroom.sport_id,
                court_number: waitingroom.court_number,
                date: waitingroom.date,
                time_slot: waitingroom.time_slot,
                list_member: waitingroom.list_member,
                is_check: false
            })
            await waitingroom.remove()
            await reservation.save()
            return true
        }
        await waitingroom.save()
        return false
    }

    async checkQuota(waitingroomdto: WaitingRoomDto, id: string): Promise<number> {
        const joinedReservations = await this.reservationModel.find({ list_member: { $in: [Types.ObjectId(id)] }, date: waitingroomdto.date, sport_id: waitingroomdto.sport_id })
        let quota: number = 4 //เลขตรงนี้ต้องไปเอามาจากsport
        for (const joinedReservation of joinedReservations) {
            quota = quota - joinedReservation.time_slot.length
        }
        return quota
    }

}