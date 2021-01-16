import { Test, TestingModule } from "@nestjs/testing"
import { DisableCourtsService } from "./disable-courts.service"

describe("DisableCourtsService", () => {
  let service: DisableCourtsService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DisableCourtsService],
    }).compile()

    service = module.get<DisableCourtsService>(DisableCourtsService)
  })

  it("should be defined", () => {
    expect(service).toBeDefined()
  })
})
