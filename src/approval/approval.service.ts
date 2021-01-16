import { Injectable, HttpException, HttpStatus } from "@nestjs/common"
import { InjectModel } from "@nestjs/mongoose"
import { Model } from "mongoose"
import { Verification, User } from "src/users/interfaces/user.interface"

@Injectable()
export class ApprovalService {
  constructor(@InjectModel("User") private readonly userModel: Model<User>) {}

  async getPersonalData(id: string): Promise<User> {
    const user = await this.userModel.findById(id).exec()

    if (!user) throw new HttpException("User not found", HttpStatus.NOT_FOUND)
    return user
  }

  async getSearchResult(name: string, start: number, end: number): Promise<[Number, User[]]> {
    let filter = this.userModel.find(
      { verification_status: Verification.Submitted },
      { _id: 1, name_en: 1, surname_en: 1, username: 1, name_th: 1, surname_th: 1 }
    )

    if (name !== undefined) {
      if ("A" <= name.charAt(0) && name.charAt(0) <= "z")
        filter = filter.find({ $or: [{ name_en: { $regex: name } }, { surname_en: { $regex: name } }] })
      else filter = filter.find({ $or: [{ name_th: { $regex: name } }, { surname_th: { $regex: name } }] })
    }

    let user = await filter
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
      ? { verification_status: Verification.Verified, account_expiration_date: options.newExpiredDate }
      : { verification_status: Verification.Rejected, rejected_info: options.rejectInfo }

    const user = await this.userModel.findByIdAndUpdate(id, { $set: setBlock }, { new: true, strict: false }).exec()

    if (!user) throw new HttpException("User not found", HttpStatus.NOT_FOUND)
    return user
  }
}
