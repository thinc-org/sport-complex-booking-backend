import { Test, TestingModule } from '@nestjs/testing';
import { AllReservationController } from './all-reservation.controller';

describe('AllReservationController', () => {
  let controller: AllReservationController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AllReservationController],
    }).compile();

    controller = module.get<AllReservationController>(AllReservationController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
