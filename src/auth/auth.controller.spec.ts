import { createMock } from '@golevelup/ts-jest';
import { Test, TestingModule } from '@nestjs/testing';
import { Response } from 'express';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController', () => {
  let controller: AuthController;

  const mockResponse = createMock<Response>();
  const mochAuthService = {
    signUp: jest.fn((dto) => {
      return {
        id: 'oejfoejfo',
        ...dto,
      };
    }),
    loginUser: jest.fn((dto) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...rest } = dto;
      return {
        id: 'oejfoejfo',
        ...rest,
        username: 'Test',
        email: 'test@mail.fr',
        roles: 'user',
        token: 'oeofeofkokfoekeofkoe',
        hasProfile: 0,
        createdAt: Date.now().toLocaleString(),
      };
    }),
  };
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [AuthService],
    })
      .overrideProvider(AuthService)
      .useValue(mochAuthService)
      .compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call signup fn and return the user  ', () => {
    const createUserDto = {
      username: 'Test',
      email: 'test@mail.fr',
      password: 'password',
    };
    expect(controller.signUp(createUserDto)).toEqual({
      id: expect.any(String),
      username: 'Test',
      email: 'test@mail.fr',
      password: 'password',
    });
    expect(mochAuthService.signUp).toHaveBeenCalledWith(createUserDto);
  });

  it('should call login fn and return user and token ', () => {
    const loginData = {
      email: '',
      username: 'Test',
      password: 'password',
    };
    expect(controller.login(loginData, mockResponse)).toEqual({
      id: expect.any(String),
      username: 'Test',
      email: 'test@mail.fr',
      roles: 'user',
      token: expect.any(String),
      hasProfile: 0,
      createdAt: expect.any(String),
    });
    expect(mochAuthService.loginUser).toHaveBeenCalledWith(
      loginData,
      mockResponse,
    );
  });
});
