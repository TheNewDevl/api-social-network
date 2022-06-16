import { Reflector } from '@nestjs/core';
import { RolesGuard } from './roles.guard';
import { createMock } from '@golevelup/ts-jest';
import { ExecutionContext } from '@nestjs/common';
import { UserRoleEnum } from '../../utils/enums/roles.enum';

describe('Roles Guard', () => {
  let guard: RolesGuard;
  const reflector: Reflector = new Reflector();

  const mockContext = createMock<ExecutionContext>({
    switchToHttp: () => ({
      getRequest: () => ({
        user: {
          roles: 'admin',
        },
      }),
      handler: 'eeg',
      getHandler: () => ({
        values: ['admin'],
      }),
    }),
  });

  jest.spyOn(reflector, 'get').mockImplementation(() => {
    return { roles: ['admin'] };
  });

  beforeEach(() => {
    guard = new RolesGuard(new Reflector());
  });

  it('mockcontext should be defined', () => {
    expect(mockContext.switchToHttp()).toBeDefined();
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  it('should return true if no roles required', async () => {
    expect(await guard.canActivate(mockContext)).toBeTruthy();
  });

  it('should return true if user has required role', async () => {
    expect(
      await guard.canActivate(mockContext, [UserRoleEnum.ADMIN]),
    ).toBeTruthy();
  });

  it('should throw an error if user has not the required role', async () => {
    try {
      await guard.canActivate(mockContext, [UserRoleEnum.USER]);
    } catch (error) {
      expect(error.status).toEqual(401);
      expect(error.message).toContain(
        "Vous n'avez pas le droit d'effectuer cette action",
      );
    }
  });
});
