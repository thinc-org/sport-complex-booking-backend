import { Test, TestingModule } from "@nestjs/testing"
import { SatitApprovalController } from "./satit-approval.controller"

describe("ApprovalController", () => {
  let controller: SatitApprovalController

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SatitApprovalController],
    }).compile()

    controller = module.get<SatitApprovalController>(SatitApprovalController)
  })

  it("should be defined", () => {
    expect(controller).toBeDefined()
  })
})
