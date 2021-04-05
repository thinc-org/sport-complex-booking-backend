import { Test, TestingModule } from "@nestjs/testing"
import { CourtManagerController } from "./court-manager.controller"

describe("CourtManagerController", () => {
  let controller: CourtManagerController

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CourtManagerController],
    }).compile()

    controller = module.get<CourtManagerController>(CourtManagerController)
  })

  it("should be defined", () => {
    expect(controller).toBeDefined()
  })
})
