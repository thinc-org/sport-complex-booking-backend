import { Test, TestingModule } from "@nestjs/testing"
import { CourtManagerService } from "./court-manager.service"

describe("CourtManagerService", () => {
  let service: CourtManagerService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CourtManagerService],
    }).compile()

    service = module.get<CourtManagerService>(CourtManagerService)
  })

  it("should be defined", () => {
    expect(service).toBeDefined()
  })
})
