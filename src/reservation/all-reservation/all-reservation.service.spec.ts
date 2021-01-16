import { Test, TestingModule } from "@nestjs/testing"
import { AllReservationService } from "./all-reservation.service"

describe("AllReservationService", () => {
  let service: AllReservationService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AllReservationService],
    }).compile()

    service = module.get<AllReservationService>(AllReservationService)
  })

  it("should be defined", () => {
    expect(service).toBeDefined()
  })
})
