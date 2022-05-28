import { createMock } from '@golevelup/ts-jest';
import { Test, TestingModule } from '@nestjs/testing';
import { Request } from 'express';
import { User } from 'src/user/entities/user.entity';
import { CreateProfileDto } from './dto/create-profile.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { Profile } from './entities/profile.entity';
import { ProfileController } from './profile.controller';
import { ProfileService } from './profile.service';

describe('ProfileController', () => {
  let controller: ProfileController;

  const mockProfileService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
  };
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProfileController],
      providers: [
        ProfileService,
        {
          provide: ProfileService,
          useValue: mockProfileService,
        },
      ],
    }).compile();

    controller = await module.resolve<ProfileController>(ProfileController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  const file = null;
  const createProfileDto = new CreateProfileDto();
  createProfileDto.firstName = 'firstname';
  createProfileDto.lastName = 'lastname';
  createProfileDto.bio = 'bio testing';

  const user = new User();
  user.id = '123';

  const req = createMock<Request>({});

  describe('create', () => {
    it('should call service and pass all args', async () => {
      const profile = await controller.create(
        file,
        createProfileDto,
        user,
        req,
      );
      expect(mockProfileService.create).toHaveBeenCalledTimes(1);
      expect(mockProfileService.create).toHaveBeenCalledWith(
        file,
        createProfileDto,
        user,
        req,
      );
    });
  });

  ////////////////
  describe('findAll', () => {
    it('should call service', async () => {
      const posts = await controller.findAll();
      expect(mockProfileService.findAll).toHaveBeenCalledTimes(1);
    });
  });

  describe('FindOne', () => {
    it('should call service method findOne', async () => {
      const post = await controller.findOne('123');
      expect(mockProfileService.findOne).toHaveBeenCalledTimes(1);
      expect(mockProfileService.findOne).toHaveBeenCalledWith('123');
    });
  });

  describe('Update', () => {
    const profile = new Profile();
    profile.id = '5555';
    profile.bio = createProfileDto.bio;
    profile.lastName = createProfileDto.lastName;
    profile.firstName = createProfileDto.firstName;

    const updateProfile = new UpdateProfileDto();
    updateProfile.bio = createProfileDto.bio;
    updateProfile.lastName = createProfileDto.lastName;
    updateProfile.firstName = createProfileDto.firstName;

    it('should call service method ', async () => {
      const post = await controller.update(profile, updateProfile, file, req);
      expect(mockProfileService.update).toHaveBeenCalledTimes(1);
      expect(mockProfileService.update).toHaveBeenCalledWith(
        profile,
        updateProfile,
        file,
        req,
      );
    });
  });
});
