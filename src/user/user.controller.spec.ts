import { Test, TestingModule } from '@nestjs/testing';
import { User } from './entities/user.entity';
import { UserController } from './user.controller';
import { UserService } from './user.service';

describe('UserController', () => {
  let controller: UserController;

  const user1 = new User();
  user1.id = '1';
  const user2 = new User();
  user2.id = '2';
  const user3 = new User();
  user3.id = '3';

  const usersArray = [user1, user2, user3];

  const mockUserService = {
    findAll: jest.fn().mockResolvedValue(usersArray),
    findOne: jest.fn((id) => {
      const user = usersArray.find((u) => u.id === id);
      return Promise.resolve(user);
    }),
    deleteUser: jest.fn((id) => {
      const user = usersArray.find((u) => u.id === id);
      if (user) {
        return Promise.resolve({ message: 'Utilisateur supprimé !' });
      }
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: UserService,
          useValue: mockUserService,
        },
      ],
    }).compile();

    controller = await module.resolve<UserController>(UserController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getAll', () => {
    it('should return users array ', async () => {
      expect(await controller.getAll()).toEqual(usersArray);
    });
    it('should return users array ', async () => {
      expect(mockUserService.findAll).toHaveBeenCalledTimes(1);
    });
  });

  describe('getOne', () => {
    it('should return the correct user ', async () => {
      expect(await controller.getOne('2')).toEqual(user2);
    });
    it('should call service   ', async () => {
      expect(mockUserService.findOne).toHaveBeenCalledTimes(1);
    });
    it('should call service   ', async () => {
      expect(mockUserService.findOne).toHaveBeenCalledWith('2');
    });
  });

  describe('delete User', () => {
    it('should return message  ', async () => {
      expect(await controller.deleteUser(user1)).toEqual({
        message: 'Utilisateur supprimé !',
      });
    });
    it('should call service method ', async () => {
      expect(mockUserService.deleteUser).toHaveBeenCalledTimes(1);
      expect(mockUserService.deleteUser).toHaveBeenCalledWith(user1.id);
    });
  });
});
