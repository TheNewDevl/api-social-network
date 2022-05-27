import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UserRepository } from 'src/repositories/user.repository';
import { User } from './entities/user.entity';
import { UserService } from './user.service';

describe('UserService', () => {
  let service: UserService;

  const user1 = new User();
  user1.id = '1';
  const user2 = new User();
  user2.id = '2';
  const user3 = new User();
  user3.id = '3';

  const usersArray = [user1, user2, user3];

  const mockUserRepository = {
    findOneUserById: jest.fn((id) => {
      const user = usersArray.find((u) => u.id === id);
      if (!user) {
        throw new NotFoundException(
          'Utilisateur introuvable, création impossible',
        );
      }
      return Promise.resolve(user);
    }),
    delete: jest.fn(),
    find: jest
      .fn()
      .mockResolvedValueOnce(usersArray)
      .mockRejectedValue(new NotFoundException('Erreur')),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getRepositoryToken(UserRepository),
          useValue: mockUserRepository,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return users array ', async () => {
      expect(await service.findAll()).toEqual(usersArray);
    });
    it('should return users array ', async () => {
      expect(mockUserRepository.find).toHaveBeenCalledTimes(1);
    });
    it('should throw an error  ', async () => {
      try {
        await service.findAll();
      } catch (error) {
        expect(error.status).toEqual(404);
      }
    });
  });

  describe('getOne', () => {
    it('should return the correct user ', async () => {
      expect(await service.findOne('2')).toEqual(user2);
    });
    it('should call service   ', async () => {
      expect(mockUserRepository.findOneUserById).toHaveBeenCalledTimes(1);
    });
    it('should call service   ', async () => {
      expect(mockUserRepository.findOneUserById).toHaveBeenCalledWith('2');
    });
    it('should throw error if user s not found ', async () => {
      try {
        expect(await service.findOne('6')).toEqual(user2);
      } catch (error) {
        expect(error.status).toEqual(404);
        expect(error.message).toEqual(
          'Utilisateur introuvable, création impossible',
        );
      }
    });
  });

  describe('delete User', () => {
    it('should return success message ', async () => {
      expect(await service.deleteUser(user1.id)).toEqual({
        message: 'Utilisateur supprimé !',
      });
    });
    it('should call repo method ', async () => {
      expect(mockUserRepository.delete).toHaveBeenCalledTimes(1);
      expect(mockUserRepository.delete).toHaveBeenCalledWith(user1.id);
    });
  });
});
