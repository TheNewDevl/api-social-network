/* eslint-disable @typescript-eslint/no-unused-vars */
import { JwtModule } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { randomUUID } from 'crypto';
import { UserRepository } from 'src/repositories/user.repository';
import { AuthService } from './auth.service';
import * as bcrypt from 'bcrypt';
describe('AuthService', () => {
  let service: AuthService;

  jest.spyOn(bcrypt, 'compare');

  const mockUserRepository = {
    create: jest.fn((dto) => dto),
    save: jest
      .fn()
      .mockImplementation((user) =>
        Promise.resolve({ id: randomUUID(), ...user }),
      ),
    findUserByUsername: jest.fn().mockImplementation((loginUserDto) => {
      const users = [
        {
          id: '1',
          username: 'Dupont',
          roles: 'user',
          hasProfile: 0,
          token: 'zfzf',
          password:
            '$2b$10$eG7Mqbymdj.FBz0dLE3Pjeb4sBsMMkn5Mt99EX1ddkwVWIgC43Pc2',
        },
        {
          id: '2',
          username: 'Dupont2',
          roles: 'user',
          hasProfile: 0,
          token: 'zfzf',
          password:
            '$2b$10$eG7Mqbymdj.FBz0dLE3Pjeb4sBsMMkn5Mt99EX1ddkwVWIgC43Pc2',
        },
        {
          id: '3',
          username: 'Dupont3',
          roles: 'user',
          hasProfile: 0,
          token: 'zfzf',
          password: 'password',
        },
      ];
      const user = users.find((p) => p.username === loginUserDto);
      if (!user) {
        throw new Error('Utilisateur introuvable');
      }
      return users.find((p) => p.username === loginUserDto);
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        JwtModule.register({
          secret: 'superprivatekey',
          signOptions: {
            expiresIn: '24h',
          },
        }),
      ],
      providers: [
        AuthService,
        {
          provide: getRepositoryToken(UserRepository),
          useValue: mockUserRepository,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  describe('signUp', () => {
    const createUserDto = {
      email: 'testtttttttttt@mail.fr',
      password: 'password',
      username: 'testttttttttt',
    };
    it('should be defined ', () => {
      expect(service).toBeDefined();
    });

    it('should call create and save methods', async () => {
      const res = await service.signUp(createUserDto);
      expect(mockUserRepository.create).toHaveBeenCalledTimes(1);
      expect(mockUserRepository.save).toHaveBeenCalledTimes(1);
    });

    it('should save an hash, not the plain text password', async () => {
      const res = await service.signUp(createUserDto);
      expect(mockUserRepository.save).toHaveBeenLastCalledWith({
        email: 'testtttttttttt@mail.fr',
        password: expect.not.stringMatching('password'),
        username: 'testttttttttt',
      });
    });

    it('should return success msg ', async () => {
      expect(await service.signUp(createUserDto)).toEqual({
        message: 'Utilisateur créé avec succes',
      });
    });

    it('role should be admin', async () => {
      await service.signUp({
        email: 'admin@groupomania.com',
        password: 'password',
        username: 'testttttttttt',
      }),
        expect(mockUserRepository.save).toHaveBeenLastCalledWith({
          email: 'admin@groupomania.com',
          password: expect.any(String),
          username: 'testttttttttt',
          roles: 'admin',
        });
    });
  });

  describe('login', () => {
    const loginUserDto = {
      username: 'Dupont',
      password: 'password',
      email: '',
    };
    it('should call bcrypt compare with hash and given password', async () => {
      const result = await service.loginUser(loginUserDto);
      expect(bcrypt.compare).toHaveBeenCalledWith(
        'password',
        '$2b$10$eG7Mqbymdj.FBz0dLE3Pjeb4sBsMMkn5Mt99EX1ddkwVWIgC43Pc2',
      );
    });

    it('should throw an error if password in not valid', async () => {
      try {
        await service.loginUser({
          username: 'Dupont',
          password: 'wrongpassword',
          email: '',
        });
      } catch (error) {
        expect(error.message).toEqual(
          'Mot de passe ou username incorrects. Veuillez vérifier vos identifiants',
        );
      }
    });

    it('should return a message ', async () => {
      const response = await service.loginUser(loginUserDto);
      expect(response.message).toEqual('Identification réussie');
    });

    it('should return user object ', async () => {
      const response = await service.loginUser(loginUserDto);
      expect(response.user).toEqual({
        id: expect.any(String),
        username: 'Dupont',
        roles: 'user',
        hasProfile: 0,
        token: expect.any(String),
      });
    });

    it('should return the correct user ', async () => {
      const response = await service.loginUser({
        username: 'Dupont2',
        password: 'password',
        email: '',
      });
      expect(response.user.id).toEqual('2');
    });

    it('should throw an error if !user', async () => {
      try {
        await service.loginUser({
          username: 'blabla',
          password: 'wrongpassword',
          email: '',
        });
      } catch (error) {
        expect(error.message).toEqual('Utilisateur introuvable');
      }
    });
  });
});
