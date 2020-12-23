
import { BadRequestException, HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { isValidObjectId, Model, Types } from 'mongoose';
import { Account, OtherUser, User, Verification } from 'src/users/interfaces/user.interface';
import { WaitingRoomDto } from './dto/waiting-room.dto';
import { Reservation, WaitingRoom } from "./interfaces/reservation.interface";


@Injectable()
export class ReservationService {
    constructor(
        @InjectModel('WaitingRoom') private WaitingRoomModel: Model<WaitingRoom>,
        @InjectModel('Reservation') private ReservationModel: Model<Reservation>,
        @InjectModel('User') private userModel: Model<User>
    ) { }

    //Test na krub by NON
    async createTestWaitingRoom(WaitingRoom: WaitingRoom): Promise<WaitingRoom> {
        const newMyWaitingRoom = new this.WaitingRoomModel(WaitingRoom);
        return newMyWaitingRoom.save();
    }

    //Test na krub by NON
    async createReservation(Reservation: Reservation): Promise<Reservation> {
        const newSuccessfulReservation = new this.ReservationModel(Reservation);
        return newSuccessfulReservation.save();
    }

    async checkValidity(id: string): Promise<boolean> {
        const user = await this.userModel.findById(id);
        if (user == null) {
            throw new HttpException("This Id does not exist.", HttpStatus.BAD_REQUEST)
        }
        if (user.account_type == Account.Other) {
            let otherUser = user as OtherUser
            let date: Date = new Date();
            date.setHours(date.getHours() + 7)//บวก7จะเปนเวลาประเทศไทย(เช็คกับฟังก์ชั่นที่approveอีกที)
            if (otherUser.verification_status != Verification.Verified) {
                throw new HttpException("Your account has to verify first", HttpStatus.UNAUTHORIZED)
            }
            else if (otherUser.account_expiration_date < date) {
                throw new HttpException("Your account has already expired, please contact staff", HttpStatus.UNAUTHORIZED)
            }
        }
        if (user.is_penalize) {
            throw new HttpException("Your account has been banned, please contact staff", HttpStatus.UNAUTHORIZED)
        }
        const haveWaitingRoom = await this.WaitingRoomModel.findOne({ list_member: { $in: [Types.ObjectId(id)] } })
        if (haveWaitingRoom) {
            throw new HttpException("You already have waiting room", HttpStatus.UNAUTHORIZED)
        }
        return true
    }

    async checkTimeSlot(waitingroomdto: WaitingRoomDto) {
        const open_time = 17
        const close_time = 40
        let availableTime = new Set<Number>()
        for (let i = open_time; i <= close_time;i++){
            availableTime.add(i)
        }
        const reservation = await this.ReservationModel.find({ court_number: waitingroomdto.court_number, date: waitingroomdto.date, sport_id: waitingroomdto.sport_id })
        const waitingroom = await this.WaitingRoomModel.find({ court_number: waitingroomdto.court_number, date: waitingroomdto.date, sport_id: waitingroomdto.sport_id })
        for (let i = 0; i < reservation.length; i++) {
            for (let j = 0; j < reservation[i].time_slot.length; j++) {
                availableTime.delete(reservation[i].time_slot[j])
            }
        }
        for (let i = 0; i < waitingroom.length; i++) {
            for (let j = 0; j < waitingroom[i].time_slot.length; j++) {
                availableTime.delete(waitingroom[i].time_slot[j])
            }
        }
        const disable_time = [21,22,23,24]
        for (let i = 0; i < disable_time.length; i++){
            availableTime.delete(disable_time[i])
        }
        return Array.from(availableTime)
    }

    makeid(length): string {
        let result: string = '';
        let characters: string = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let charactersLength: number = characters.length;
        for (let i = 0; i < length; i++) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }
        return result;
    }

    async createWaitingRoom(waitingroomdto: WaitingRoomDto, id: string): Promise<WaitingRoom> {
        const availableTime = this.checkTimeSlot(waitingroomdto)
        if(await this.checkQuota(waitingroomdto,id)<waitingroomdto.time_slot.length){
            throw new HttpException("You have not enough quotas", HttpStatus.UNAUTHORIZED)
        }
        //if((await availableTime).includes(waitingroomdto.time_slot.values)
        const waitingroom = new this.WaitingRoomModel(waitingroomdto)
        waitingroom.list_member.push(Types.ObjectId(id))
        let date: Date = new Date();
        const waiting_room_duration: number = 15 //เวลาตรงนี้ต้องไปเอามาจากsetting
        date.setMinutes(date.getMinutes() + waiting_room_duration)
        waitingroom.expired_date = date
        let access_code: string = this.makeid(6);
        while (true) {
            const sameCode = await this.WaitingRoomModel.findOne({ access_code: access_code })
            if (!sameCode) {
                break
            }
            access_code = this.makeid(6);
        }
        waitingroom.access_code = access_code
        return await waitingroom.save()
    }

    async joinWaitingRoom(access_code: string, id: string) {
        const waitingroom = await this.WaitingRoomModel.findOne({ access_code: access_code })
        if (!waitingroom) {
            throw new HttpException("The code is wrong.", HttpStatus.BAD_REQUEST)
        }
        waitingroom.list_member.push(Types.ObjectId(id))
        let required_member: number = 2 //เลขตรงนี้ต้องไปเอามาจากsport
        if (waitingroom.list_member.length == required_member) {
            const reservation = new this.ReservationModel({
                sport_id: waitingroom.sport_id,
                court_number: waitingroom.court_number,
                date: waitingroom.date,
                time_slot: waitingroom.time_slot,
                list_member: waitingroom.list_member,
                is_check: false
            })
            await waitingroom.remove()
            return await reservation.save()
        }
        return await waitingroom.save()
    }

    async checkQuota(waitingroomdto: WaitingRoomDto, id: string) {
        const joinedReservation = await this.ReservationModel.find({ list_member: { $in: [Types.ObjectId(id)] }, date: waitingroomdto.date, sport_id: waitingroomdto.sport_id })
        let quota: number = 6 //เลขตรงนี้ต้องไปเอามาจากsport
        for (let i = 0; i < joinedReservation.length; i++) {
            for (let j = 0; j < joinedReservation[i].time_slot.length; j++) {
                quota = quota - joinedReservation[i].time_slot.length
            }
        }
        return quota
    }

}