import { Module } from '@nestjs/common';
import {ApprovalService} from "./approval.service"
import {MongooseModule} from "@nestjs/mongoose"
import {OtherSchema} from "./schemas/approval.schema"
import { ApprovalController } from './approval.controller';
@Module({
    imports:[MongooseModule.forFeature([{name:"Other",schema:OtherSchema}])],
    providers:[ApprovalService],
    controllers: [ApprovalController]
})
export class ApprovalModule {}
