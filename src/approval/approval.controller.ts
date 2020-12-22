import { Controller, Get ,Param,Patch,Body, Query,UseGuards,Req,HttpException,HttpStatus} from '@nestjs/common';
import { ApprovalService } from './approval.service';
import {JwtAuthGuard, StaffGuard } from 'src/auth/jwt.guard'

@UseGuards(StaffGuard)
@Controller('approval')
export class ApprovalController {
    constructor(private readonly approvalService: ApprovalService) {}

  @Get()
  getSearchResult(@Query() query,@Req() req){
    return this.approvalService.getSearchResult(query.name,query.start,query.end);
  }
  
  @Get("/:id")
  getPersonalData(@Param('id') id:string,@Req() req){
    return this.approvalService.getPersonalData(id);
  }

  @Patch("/approve")
  approve(@Body('id') id:string,@Body('newExpiredDate') newExpiredDate:Date,@Req() req){
    return this.approvalService.approve(id,newExpiredDate);
  }

  @Patch("/reject")
  reject(@Body('id') id:string,@Body('reject_info') reject_info:string[],@Req() req){
    return this.approvalService.reject(id,reject_info);
  }
}
