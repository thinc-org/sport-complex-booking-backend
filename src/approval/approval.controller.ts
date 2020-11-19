import { Controller, Get ,Param,Patch,Body, UseGuards,Req,HttpStatus,HttpException} from '@nestjs/common';
import { ApprovalService } from './approval.service';
import {JwtAuthGuard } from 'src/auth/jwt.guard'
@Controller('approval')
export class ApprovalController {
    constructor(private readonly approvalService: ApprovalService) {}

  @UseGuards(JwtAuthGuard)  
  @Get('/:start/:end')
  getByRange(@Param('start') start:number,@Param('end') end:number,@Req() req){
    if (!req.user.isStaff) throw new HttpException('Staff only', HttpStatus.UNAUTHORIZED)
    return this.approvalService.getByRange(start,end);
  }
  
  @UseGuards(JwtAuthGuard)  
  @Get("/:query/:start/:end")
  getSearchResult(@Param('query') query:string,@Param('start') start:number,
                  @Param('end') end:number,@Req() req){
    if (!req.user.isStaff) throw new HttpException('Staff only', HttpStatus.UNAUTHORIZED)
    return this.approvalService.getSearchResult(query,start,end);
  }
  
  @UseGuards(JwtAuthGuard)  
  @Get("/:username")
  getPersonalData(@Param('username') username:string,@Req() req){
    if (!req.user.isStaff) throw new HttpException('Staff only', HttpStatus.UNAUTHORIZED)
    return this.approvalService.getPersonalData(username);
  }

  @UseGuards(JwtAuthGuard)  
  @Patch("/approve")
  approve(@Body('username') username:string,@Body('newExpiredDate') newExpiredDate:Date,@Req() req){
    if (!req.user.isStaff) throw new HttpException('Staff only', HttpStatus.UNAUTHORIZED)
    return this.approvalService.approve(username,newExpiredDate);
  }

  @UseGuards(JwtAuthGuard)  
  @Patch("/reject")
  reject(@Body('username') username:string,@Body('reject_info') reject_info:[string],@Req() req){
    if (!req.user.isStaff) throw new HttpException('Staff only', HttpStatus.UNAUTHORIZED)
    return this.approvalService.reject(username,reject_info);
  }
}
