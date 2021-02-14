import { Controller, Get, Param, Patch, Body, Query, UseGuards } from "@nestjs/common"
import { ApprovalService } from "./approval.service"
import { StaffGuard } from "src/auth/jwt.guard"

@UseGuards(StaffGuard)
@Controller("approval")
export class ApprovalController {
  constructor(private readonly approvalService: ApprovalService) { }

  @Get()
  getSearchResult(@Query() query) {
    return this.approvalService.getSearchResult(query.name, query.start, query.end, query.searchType)
  }

  @Get("/:id")
  getPersonalData(@Param("id") id: string) {
    return this.approvalService.getPersonalData(id)
  }

  @Patch("/approve")
  approvalApprove(@Body("id") id: string, @Body("newExpiredDate") newExpiredDate: Date) {
    return this.approvalService.setApprovalstatus(id, true, { newExpiredDate: newExpiredDate })
  }

  @Patch("/reject")
  approvalReject(@Body("id") id: string, @Body("reject_info") rejectInfo: string[]) {
    return this.approvalService.setApprovalstatus(id, false, { rejectInfo: rejectInfo })
  }

  @Patch("/extension/approve")
  extensionApprove(@Body("id") id: string, @Body("newExpiredDate") newExpiredDate: Date) {
    return this.approvalService.setPaymentstatus(id, true, newExpiredDate)
  }

  @Patch("/extension/reject")
  extensionReject(@Body("id") id: string) {
    return this.approvalService.setPaymentstatus(id, false)
  }


}
