import { Module } from '@nestjs/common';
import {ApprovalService} from "./approval.service"
import {MongooseModule} from "@nestjs/mongoose"
import {UserSchema} from "./schemas/approval.schema"
import { ApprovalController } from './approval.controller';
@Module({
    imports:[MongooseModule.forFeature([{name:"User",schema:UserSchema}])],
    providers:[ApprovalService],
    controllers: [ApprovalController]
})
export class ApprovalModule {}
