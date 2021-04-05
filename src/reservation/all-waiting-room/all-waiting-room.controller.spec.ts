import { Test, TestingModule } from "@nestjs/testing"
import { AllWaitingRoomController } from "./all-waiting-room.controller"

describe("AllWaitingRoomController", () => {
  let controller: AllWaitingRoomController

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AllWaitingRoomController],
    }).compile()

    controller = module.get<AllWaitingRoomController>(AllWaitingRoomController)
  })

  it("should be defined", () => {
    expect(controller).toBeDefined()
  })
})
