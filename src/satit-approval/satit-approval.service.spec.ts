import { Test, TestingModule } from "@nestjs/testing"
import { SatitApprovalService } from "./satit-approval.service"

describe("SatitApprovalService", () => {
  let service: ApprovalService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SatitApprovalService],
    }).compile()

    service = module.get<SatitApprovalService>(SatitApprovalService)
  })

  it("should be defined", () => {
    expect(service).toBeDefined()
  })
})
