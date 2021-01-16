import { Test, TestingModule } from "@nestjs/testing"
import { StaffManagerService } from "./staff-manager.service"

describe("StaffManagerService", () => {
  let service: StaffManagerService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [StaffManagerService],
    }).compile()

    service = module.get<StaffManagerService>(StaffManagerService)
  })

  it("should be defined", () => {
    expect(service).toBeDefined()
  })
})
