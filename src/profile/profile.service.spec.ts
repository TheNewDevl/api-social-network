import { createMock } from '@golevelup/ts-jest';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Request } from 'express';
import { ProfileRepository } from 'src/repositories/profile.repository';
import { UserRepository } from 'src/repositories/user.repository';
import { User } from 'src/user/entities/user.entity';
import { CreateProfileDto } from './dto/create-profile.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { Profile } from './entities/profile.entity';
import { ProfileService } from './profile.service';
import * as fs from 'fs';

describe('ProfileService', () => {
  let service: ProfileService;

  const user1 = new User();
  user1.id = '1';
  const user2 = new User();
  user2.id = '2';
  const user3 = new User();
  user3.id = '3';
  const usersArray = [user1, user2, user3];

  const file = null;
  const file2 = createMock<Express.Multer.File>({
    filename: 'cutedogs.jpg',
    path: './images/cutedogs.jpg',
  });

  const createProfileDto = new CreateProfileDto();
  createProfileDto.firstName = 'firstname';
  createProfileDto.lastName = 'lastname';
  createProfileDto.bio = 'bio testing';

  const user = new User();
  user.id = '123';

  const profile1 = new Profile();
  profile1.id = '1';
  profile1.firstName = 'firstname';
  profile1.lastName = 'lastname';
  profile1.bio = 'bio testing';

  const profile2 = new Profile();
  profile2.id = '2';
  profile2.firstName = 'firstname';
  profile2.lastName = 'lastname';
  profile2.bio = 'bio testing';
  profile2.photo = 'http://localhost/initialpic.jpg';

  const profilesArray = [profile1, profile2];
  const req = createMock<Request>({
    protocol: 'http',
    host: 'localhost',
    get(): string {
      return this.host;
    },
  });

  const mockRepoProfile = createMock<ProfileRepository>({
    create: jest
      .fn()
      .mockImplementation((createProfileDto) => createProfileDto),
    saveProfile: jest.fn().mockImplementation((profile) => profile),
    findAllProfiles: jest
      .fn()
      .mockResolvedValueOnce([profile1, profile2])
      .mockRejectedValue(new BadRequestException('')),
    getProfileIncludingPosts: jest.fn().mockImplementation((id) => {
      const profile = profilesArray.find((p) => p.id === id);
      if (profile) {
        return Promise.resolve(profile);
      } else {
        throw new NotFoundException('not found');
      }
    }),
    updateProfile: jest.fn().mockImplementation((newProfile, id) => {
      const profile = profilesArray.find((p) => p.id === id);
      if (profile) {
        return Promise.resolve(profile);
      } else {
        throw new NotFoundException('not found');
      }
    }),
  });

  const mockRepoUser = createMock<UserRepository>({
    findOneUserById: jest.fn((id) => {
      const user = usersArray.find((u) => u.id === id);
      if (!user) {
        throw new NotFoundException(
          'Utilisateur introuvable, création impossible',
        );
      } else {
        return Promise.resolve(user);
      }
    }),

    saveUser: jest.fn(),
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProfileService,
        {
          provide: getRepositoryToken(ProfileRepository),
          useValue: mockRepoProfile,
        },
        {
          provide: getRepositoryToken(UserRepository),
          useValue: mockRepoUser,
        },
      ],
    }).compile();

    service = module.get<ProfileService>(ProfileService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should return msg and created profile', async () => {
      const profile = await service.create(file, createProfileDto, user1, req);
      expect(profile).toEqual({
        message: 'Profil sauvegardé',
        profile: {
          bio: 'bio testing',
          firstName: 'firstname',
          lastName: 'lastname',
          user: { hasProfile: 1, id: '1' },
        },
      });
    });

    it('should call methods passing args ', async () => {
      expect(mockRepoUser.findOneUserById).toHaveBeenCalledTimes(1);
      expect(mockRepoUser.findOneUserById).toHaveBeenCalledWith(user1.id);

      expect(mockRepoProfile.create).toHaveBeenCalledTimes(1);
      expect(mockRepoProfile.create).toHaveBeenCalledWith({
        bio: 'bio testing',
        firstName: 'firstname',
        lastName: 'lastname',
        user: { hasProfile: 1, id: '1' },
      });

      expect(mockRepoProfile.saveProfile).toHaveBeenCalledTimes(1);
      expect(mockRepoProfile.saveProfile).toHaveBeenCalledWith({
        bio: 'bio testing',
        firstName: 'firstname',
        lastName: 'lastname',
        user: { hasProfile: 1, id: '1' },
      });

      expect(mockRepoUser.saveUser).toHaveBeenCalledTimes(1);
      expect(mockRepoUser.saveUser).toHaveBeenCalledWith({
        hasProfile: 1,
        id: '1',
      });

      mockRepoUser.findOneUserById.mockClear();
      mockRepoUser.saveUser.mockClear();
      mockRepoProfile.create.mockClear();
      mockRepoProfile.saveProfile.mockClear();
    });

    it('photo property should be undefined', async () => {
      const profile = await service.create(file, createProfileDto, user1, req);
      expect(profile.profile.photo).toBeUndefined();
    });

    it('photo property should be defined', async () => {
      const profile = await service.create(file2, createProfileDto, user1, req);
      expect(profile.profile.photo).toBeDefined();
    });

    it('should throw error', async () => {
      const user4 = new User();
      user4.id = '555';
      try {
        const profile = await service.create(
          file2,
          createProfileDto,
          user4,
          req,
        );
      } catch (error) {
        expect(error.status).toEqual(404);
      }
    });
  });

  describe('findAll', () => {
    it('sould return profiles ', async () => {
      const profile = await service.findAll();
      expect(profile).toEqual([profile1, profile2]);
    });

    it('sould call service ', async () => {
      expect(mockRepoProfile.findAllProfiles).toHaveBeenCalledTimes(1);
      mockRepoProfile.findAllProfiles.mockClear();
    });
    it('sould throw error ', async () => {
      try {
        const profile = await service.findAll();
        expect(profile).toBeUndefined();
      } catch (error) {
        expect(error.status).toEqual(400);
      }
    });
  });

  describe('findOne', () => {
    it('sould return profile', async () => {
      const profile = await service.findOne(profile1.id);
      expect(profile).toEqual(profile1);
    });
    it('sould call method passing id ', async () => {
      expect(mockRepoProfile.getProfileIncludingPosts).toHaveBeenCalledTimes(1);
      expect(mockRepoProfile.getProfileIncludingPosts).toHaveBeenCalledWith(
        profile1.id,
      );
    });

    it('sould throw error ', async () => {
      try {
        const profile = await service.findOne('5');
      } catch (error) {
        expect(error.status).toEqual(404);
      }
    });
  });

  describe('update', () => {
    const updateProfileDto = new UpdateProfileDto();
    updateProfileDto.bio = 'new bio ';
    updateProfileDto.firstName = 'new first';
    updateProfileDto.lastName = 'new last';

    it('should return message ', async () => {
      const up = await service.update(profile1, updateProfileDto, file, req);
      expect(up).toEqual({ message: 'Profil modifié !' });
    });

    it('should should call updateProfile repo method ', async () => {
      expect(mockRepoProfile.updateProfile).toHaveBeenCalledTimes(1);
      expect(mockRepoProfile.updateProfile).toHaveBeenCalledWith(
        updateProfileDto,
        profile1.id,
      );
      mockRepoProfile.updateProfile.mockClear();
    });

    it('should replace img url ', async () => {
      const unlinkSpy = jest.spyOn(fs, 'unlink');
      const up = await service.update(profile2, updateProfileDto, file2, req);
      expect(mockRepoProfile.updateProfile).toHaveBeenCalledWith(
        {
          bio: 'new bio ',
          firstName: 'new first',
          lastName: 'new last',
          photo: 'http://localhost/cutedogs.jpg',
        },
        '2',
      );
    });

    it('should throw error', async () => {
      const unlinkSpy = jest.spyOn(fs, 'unlink');
      const profile3 = new Profile();
      try {
        const up = await service.update(profile3, updateProfileDto, file2, req);
      } catch (error) {
        expect(error.status).toEqual(404);
      }
    });
  });
});
