import { Injectable, HttpException, HttpStatus } from "@nestjs/common"
import { InjectModel } from "@nestjs/mongoose"
import { Model } from "mongoose"
import { User, SatitCuPersonelUser } from "src/users/interfaces/user.interface"
import { FSService } from "src/fs/fs.service";

@Injectable()
export class SatitApprovalService {
  constructor(@InjectModel("User") private readonly userModel: Model<User>, private readonly fsService: FSService) { }

  async getPersonalData(id: string): Promise<User> {
    const user = await this.userModel.findById(id).exec()

    if (!user) throw new HttpException("User not found", HttpStatus.NOT_FOUND)
    return user
  }

  async getSearchResult(name: string, start: number, end: number, searchType: string): Promise<[number, User[]]> {

    const queryBlock = [];

    queryBlock.push({ student_card_photo: { $exist: true } })

    if (searchType === "extension") queryBlock.push({ verification_status: "Verified", document_status: "Submitted" });
    else if (searchType === "approval") queryBlock.push({ verification_status: "Submitted" });
    else queryBlock.push({
      $or: [{ verification_status: "Submitted" }, { verification_status: "Verified", document_status: "Submitted" }]
    });

    if (name !== undefined) {
      if ("A" <= name.charAt(0) && name.charAt(0) <= "z")
        queryBlock.push({ $or: [{ name_en: { $regex: name } }, { surname_en: { $regex: name } }] })
      else queryBlock.push({ $or: [{ name_th: { $regex: name } }, { surname_th: { $regex: name } }] })
    }

    let user = await this.userModel.find({ $and: queryBlock }, { _id: 1, name_en: 1, surname_en: 1, username: 1, name_th: 1, surname_th: 1 });
    const length = user.length
    if (start !== undefined) {
      start = Number(start)
      if (end === undefined) user = user.slice(start)
      else {
        end = Number(end)
        user = user.slice(start, end)
      }
    }

    return [length, user]
  }
  async setApprovalstatus(id: string, isApprove: boolean, options: { newExpiredDate?: Date; rejectInfo?: string[] }): Promise<User> {
    if (isApprove && options.newExpiredDate === null) throw new HttpException("Cannot find newExpiredDate in req.body", HttpStatus.BAD_REQUEST)

    if (!isApprove && options.rejectInfo === null) throw new HttpException("Cannot find reject_info in req.body", HttpStatus.BAD_REQUEST)

    const setBlock = isApprove
      ? { verification_status: "Verified", account_expiration_date: options.newExpiredDate }
      : { verification_status: "Rejected", rejected_info: options.rejectInfo }

    const user = await this.userModel.findByIdAndUpdate(id, { $set: setBlock }, { new: true, strict: false });

    if (!user) throw new HttpException("User not found", HttpStatus.NOT_FOUND)

    if (isApprove)
      await this.fsService.updateStudentCardPhoto((user) as SatitCuPersonelUser);

    return user
  }

  async setStudentCardstatus(id: string, isApprove: boolean, newExpiredDate?: Date): Promise<User> {
    if (isApprove && newExpiredDate === null) throw new HttpException("Cannot find newExpiredDate in req.body", HttpStatus.BAD_REQUEST)

    const setBlock = isApprove
      ? { student_card_photo_status: "NotSubmitted", account_expiration_date: newExpiredDate }
      : { student_card_photo_status: "Rejected" }

    const user = await this.userModel.findByIdAndUpdate(id, { $set: setBlock }, { new: true, strict: false });

    if (!user) throw new HttpException("User not found", HttpStatus.NOT_FOUND)

    if (isApprove)
      await this.fsService.updateStudentCardPhoto((user) as SatitCuPersonelUser);

    return user
  }
}
