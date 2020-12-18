import { Controller, Get ,Param,Patch,Body, Query,UseGuards,Req,HttpException,HttpStatus} from '@nestjs/common';
import { ApprovalService } from './approval.service';
import {JwtAuthGuard } from 'src/auth/jwt.guard'
@Controller('approval')
export class ApprovalController {
    constructor(private readonly approvalService: ApprovalService) {}

  @UseGuards(JwtAuthGuard)  
  @Get()
  getSearchResult(@Query() query,@Req() req){
    if (!req.user.isStaff) throw new HttpException('Staff only', HttpStatus.UNAUTHORIZED)
    return this.approvalService.getSearchResult(query.name,query.start,query.end);
  }
  
  @UseGuards(JwtAuthGuard)  
  @Get("/:id")
  getPersonalData(@Param('id') id:string,@Req() req){
    if (!req.user.isStaff) throw new HttpException('Staff only', HttpStatus.UNAUTHORIZED)
    return this.approvalService.getPersonalData(id);
  }

  @UseGuards(JwtAuthGuard)  
  @Patch("/approve")
  approve(@Body('id') id:string,@Body('newExpiredDate') newExpiredDate:Date,@Req() req){
    if (!req.user.isStaff) throw new HttpException('Staff only', HttpStatus.UNAUTHORIZED)
    return this.approvalService.approve(id,newExpiredDate);
  }

  @UseGuards(JwtAuthGuard)  
  @Patch("/reject")
  reject(@Body('id') id:string,@Body('reject_info') reject_info:string[],@Req() req){
    if (!req.user.isStaff) throw new HttpException('Staff only', HttpStatus.UNAUTHORIZED)
    return this.approvalService.reject(id,reject_info);
  }
}
