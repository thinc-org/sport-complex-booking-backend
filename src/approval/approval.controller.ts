import { Controller, Get, Param, Patch, Body, Query, UseGuards } from "@nestjs/common"
import { ApprovalService } from "./approval.service"
import { StaffGuard } from "src/auth/jwt.guard"
import { CreateOtherUserDTO } from "src/users/dto/user.dto";
import { ApproveDTO, RejectDTO, searchResultDTO, SetStatusDTO } from "./dto/approval.dto"
import {
  ApiBadRequestResponse,
  ApiBearerAuth, ApiBody, ApiNotFoundResponse,
  ApiOkResponse,
  ApiParam,
  ApiQuery,
  ApiTags,
  ApiUnauthorizedResponse,
} from "@nestjs/swagger"

@ApiTags("approval")
@ApiUnauthorizedResponse({ description: "Must be staff to use this endpoints" })
@ApiBearerAuth()
@UseGuards(StaffGuard)
@Controller("approval")
export class ApprovalController {
  constructor(private readonly approvalService: ApprovalService) { }

  @ApiQuery({ name: "searchType", type: String, description: "\"approval\" or \"extension\" or null", required: false })
  @ApiQuery({ name: "end", type: Number, required: false })
  @ApiQuery({ name: "start", type: Number, required: false })
  @ApiQuery({ name: "name", type: String, description: "substring of name or surname of user", required: false })
  @ApiOkResponse({ description: "Return query results", type: searchResultDTO })
  @Get()
  getSearchResult(@Query() query) {
    return this.approvalService.getSearchResult(query.name, query.start, query.end, query.searchType)
  }

  @ApiParam({ name: "id", type: String, description: "a user's ObjectID" })
  @ApiOkResponse({ description: "Return a user with id in param", type: CreateOtherUserDTO })
  @ApiNotFoundResponse({ description: "Can't find a user" })
  @Get("/:id")
  getPersonalData(@Param("id") id: string) {
    return this.approvalService.getPersonalData(id)
  }

  @ApiBody({ type: ApproveDTO })
  @ApiOkResponse({ description: "Approve and return the registeration of a user", type: CreateOtherUserDTO })
  @ApiBadRequestResponse({ description: "Invalid body" })
  @Patch("/approve")
  approvalApprove(@Body("id") id: string, @Body("newExpiredDate") newExpiredDate: Date) {
    return this.approvalService.setApprovalstatus(id, true, { newExpiredDate: newExpiredDate })
  }

  @ApiBody({ type: RejectDTO })
  @ApiOkResponse({ description: "Reject and return the registeration of a user", type: CreateOtherUserDTO })
  @ApiBadRequestResponse({ description: "Invalid body" })
  @Patch("/reject")
  approvalReject(@Body("id") id: string, @Body("reject_info") rejectInfo: string[]) {
    return this.approvalService.setApprovalstatus(id, false, { rejectInfo: rejectInfo })
  }

  @ApiBody({ type: ApproveDTO })
  @ApiOkResponse({ description: "Approve and return the member extension of a user", type: CreateOtherUserDTO })
  @ApiBadRequestResponse({ description: "Invalid body" })
  @Patch("/extension/approve")
  extensionApprove(@Body("id") id: string, @Body("newExpiredDate") newExpiredDate: Date) {
    return this.approvalService.setPaymentstatus(id, true, newExpiredDate)
  }

  @ApiBody({ type: SetStatusDTO })
  @ApiOkResponse({ description: "Reject and return the member extension of a user", type: CreateOtherUserDTO })
  @ApiBadRequestResponse({ description: "Invalid body" })
  @Patch("/extension/reject")
  extensionReject(@Body("id") id: string) {
    return this.approvalService.setPaymentstatus(id, false)
  }


}
