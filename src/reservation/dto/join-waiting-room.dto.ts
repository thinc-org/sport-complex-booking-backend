import * as mongoose from "mongoose"

export class JoinWaitingRoomDto extends mongoose.Document {
  access_code: string
}
