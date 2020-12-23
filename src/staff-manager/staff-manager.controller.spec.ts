import { Test, TestingModule } from '@nestjs/testing';
import { StaffManagerController } from './staff-manager.controller';

describe('StaffManagerController', () => {
  let controller: StaffManagerController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StaffManagerController],
    }).compile();

    controller = module.get<StaffManagerController>(StaffManagerController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
