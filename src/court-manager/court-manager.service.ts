import { Injectable, HttpException, HttpStatus, BadRequestException } from "@nestjs/common"
import { Court, Sport } from "./interfaces/sportCourt.interface"
import { Setting } from "./interfaces/setting.interface"
import { Model, isValidObjectId } from "mongoose"
import { InjectModel } from "@nestjs/mongoose"

@Injectable()
export class CourtManagerService {
  constructor(
    @InjectModel("Sport") private Sport: Model<Sport>,
    @InjectModel("Courts") private Court: Model<Court>,
    @InjectModel("Setting") private Setting: Model<Setting>
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

  async updateSetting(new_setting: Setting): Promise<Setting> {
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
  async createSport(court_data: Sport): Promise<Sport> {
    if (court_data.required_user < 2) throw new BadRequestException("Required user must be at least 2.")
    if (court_data.quota < 0) throw new BadRequestException("Quota must be a non-negative number.")

    const doc = await this.Sport.findOne({ $or: [{ sport_name_th: court_data.sport_name_th }, { sport_name_en: court_data.sport_name_en }] })

    if (doc) throw new BadRequestException("This Sport already exist.")

    const setTime = new this.Sport(court_data)
    return setTime.save()
  }

  //update only sport setting, not court's setting
  async updateSport(
    sportID: string,
    newSportSetting: { sport_name_th: string; sport_name_en: string; required_user: number; quota: number }
  ): Promise<Sport> {
    if (newSportSetting.required_user < 2) throw new BadRequestException("Required user must be at least 2.")
    if (newSportSetting.quota < 0) throw new BadRequestException("Quota must be a non-negative number.")

    const Sport = await this.findSportByID(sportID)
    Sport.required_user = newSportSetting.required_user
    Sport.quota = newSportSetting.quota

    return await Sport.save()
  }

  //delete sport by its _id
  async deleteSport(sportID: string): Promise<Sport> {
    if (!isValidObjectId(sportID)) {
      throw new HttpException("Invalid Id.", HttpStatus.BAD_REQUEST)
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

  //update a court by court number and its data
  async updateCourtbyID(sportID: string, newSettings: Court[]): Promise<Sport> {
    //check court time slot (1-48)
    newSettings.forEach((eachSetting) => {
      if (eachSetting.open_time < 1 || eachSetting.close_time > 48) {
        throw new HttpException("Time slot is between 1 and 48.", HttpStatus.BAD_REQUEST)
      }
      if (eachSetting.open_time >= eachSetting.close_time) {
        throw new HttpException("Time slot is between 1 and 48.", HttpStatus.BAD_REQUEST)
      }
    })
    const doc = await this.findSportByID(sportID)
    doc.list_court = newSettings
    return await doc.save()
  }

  async findAllSport(): Promise<Sport[]> {
    return await this.Sport.find({})
  }
}
