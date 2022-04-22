import { Injectable, CanActivate, ExecutionContext, Req } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRoleEnum } from 'src/enums/roles.enum';
import { ROLES_KEY } from '../roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
    constructor(private readonly reflector: Reflector) {
    }

    canActivate(context: ExecutionContext): boolean {
        const requiredRoles = this.reflector.get<UserRoleEnum[]>(ROLES_KEY,
            context.getHandler(),
        );

        if (!requiredRoles) {
            return true;
        }

        const { user } = context.switchToHttp().getRequest();
        console.log(user);

        return requiredRoles.some((role) => user.roles?.includes(role));
    }
}