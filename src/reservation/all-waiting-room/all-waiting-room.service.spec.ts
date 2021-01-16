import { Test, TestingModule } from "@nestjs/testing"
import { AllWaitingRoomService } from "./all-waiting-room.service"

describe("AllWaitingRoomService", () => {
  let service: AllWaitingRoomService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AllWaitingRoomService],
    }).compile()

    service = module.get<AllWaitingRoomService>(AllWaitingRoomService)
  })

  it("should be defined", () => {
    expect(service).toBeDefined()
  })
})
