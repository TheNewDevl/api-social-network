import { Test, TestingModule } from '@nestjs/testing';
import { ProfileController } from './profile.controller';
import { ProfileService } from './profile.service';

describe('ProfileController', () => {
  let controller: ProfileController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProfileController],
      providers: [ProfileService],
    })
      .overrideProvider(ProfileService)
      .useValue({
        findAll: jest.fn(() => [1, 2, 3]),
      })
      .compile();

    controller = module.get<ProfileController>(ProfileController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
  it('should be defined', () => {
    expect(controller.findAll()).toBeDefined();
  });
});
