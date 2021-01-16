import { Test, TestingModule } from "@nestjs/testing"
import { DisableCourtsController } from "./disable-courts.controller"

describe("DisableCourtsController", () => {
  let controller: DisableCourtsController

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DisableCourtsController],
    }).compile()

    controller = module.get<DisableCourtsController>(DisableCourtsController)
  })

  it("should be defined", () => {
    expect(controller).toBeDefined()
  })
})
