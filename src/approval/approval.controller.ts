import { Controller, Get ,Param,Patch,Body} from '@nestjs/common';
import { ApprovalService } from './approval.service';

@Controller('approval')
export class ApprovalController {
    constructor(private readonly approvalService: ApprovalService) {}
  
  /*@Get()
    getAll(){
      return this.approvalService.getAll();
    }*/
    
  @Get("/:start/:end")
  getByRange(@Param('start') start:number,@Param('end') end:number){
    return this.approvalService.getByRange(start,end);
  }
  
  @Get("/:start/:end/:query")
  getSearchResult(@Param('query') query:string,@Param('start') start:number,@Param('end') end:number){
    return this.approvalService.getSearchResult(query,start,end);

  }
  
  @Get("/:username")
  getPersonalData(@Param('username') username:string){
    return this.approvalService.getPersonalData(username);
  }

  @Patch("/approve")
  approve(@Body('username') username:string,@Body('newExpiredDate') newExpiredDate:Date){
    this.approvalService.approve(username,newExpiredDate);
    return this.approvalService.getPersonalData(username);
  }

  @Patch("/reject")
  reject(@Body('username') username:string,@Body('reject_info') reject_info:[string]){
    this.approvalService.reject(username,reject_info);
    return this.approvalService.getPersonalData(username);
  }
}
