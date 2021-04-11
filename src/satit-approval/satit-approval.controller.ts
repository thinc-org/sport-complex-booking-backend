import { Controller, Get, Param, Patch, Body, Query, UseGuards } from "@nestjs/common"
import { SatitApprovalService } from "./satit-approval.service"
import { AdminGuard } from "src/auth/jwt.guard"
import { SatitUserDTO } from "./dto/satit-approval.dto"
import { ApproveDTO, RejectDTO, SearchResultDTO, SetStatusDTO } from "./dto/satit-approval.dto"
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiNotFoundResponse,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiParam,
  ApiQuery,
  ApiTags,
  ApiUnauthorizedResponse,
} from "@nestjs/swagger"

@ApiTags("satit-approval")
@ApiUnauthorizedResponse({ description: "User is not logged in" })
@ApiForbiddenResponse({ description: "Must be staff to use this endpoints" })
@ApiBearerAuth()
@UseGuards(AdminGuard)
@Controller("satit-approval")
export class SatitApprovalController {
  constructor(private readonly satitApprovalService: SatitApprovalService) { }

  @ApiQuery({ name: "searchType", type: String, description: "\"approval\" or \"extension\" or null", required: false })
  @ApiQuery({ name: "end", type: Number, required: false })
  @ApiQuery({ name: "start", type: Number, required: false })
  @ApiQuery({ name: "name", type: String, description: "Substring of name or surname of satit user", required: false })
  @ApiOkResponse({ description: "Return query results", type: SearchResultDTO })
  @Get()
  getSearchResult(@Query() query) {
    return this.satitApprovalService.getSearchResult(query.name, query.start, query.end, query.searchType)
  }

  @ApiParam({ name: "id", type: String, description: "A user's ObjectID" })
  @ApiOkResponse({ description: "Return a user with id in param", type: SatitUserDTO })
  @ApiNotFoundResponse({ description: "Can't find a user" })
  @Get("/:id")
  getPersonalData(@Param("id") id: string) {
    return this.satitApprovalService.getPersonalData(id)
  }

  @ApiBody({ type: ApproveDTO })
  @ApiOkResponse({ description: "Approve and return the registeration of a satit user", type: SatitUserDTO })
  @ApiBadRequestResponse({ description: "Invalid body" })
  @Patch("/approve")
  approvalApprove(@Body("id") id: string, @Body("newExpiredDate") newExpiredDate: Date) {
    return this.satitApprovalService.setApprovalstatus(id, true, { newExpiredDate: newExpiredDate })
  }

  @ApiBody({ type: RejectDTO })
  @ApiOkResponse({ description: "Reject and return the registeration of a satit user", type: SatitUserDTO })
  @ApiBadRequestResponse({ description: "Invalid body" })
  @Patch("/reject")
  approvalReject(@Body("id") id: string, @Body("reject_info") rejectInfo: string[]) {
    return this.satitApprovalService.setApprovalstatus(id, false, { rejectInfo: rejectInfo })
  }

  @ApiBody({ type: ApproveDTO })
  @ApiOkResponse({ description: "Approve and return the member extension of a satit user", type: SatitUserDTO })
  @ApiBadRequestResponse({ description: "Invalid body" })
  @Patch("/extension/approve")
  extensionApprove(@Body("id") id: string, @Body("newExpiredDate") newExpiredDate: Date) {
    return this.satitApprovalService.setStudentCardstatus(id, true, newExpiredDate)
  }

  @ApiBody({ type: SetStatusDTO })
  @ApiOkResponse({ description: "Reject and return the member extension of a satit user", type: SatitUserDTO })
  @ApiBadRequestResponse({ description: "Invalid body" })
  @Patch("/extension/reject")
  extensionReject(@Body("id") id: string) {
    return this.satitApprovalService.setStudentCardstatus(id, false)
  }
}
