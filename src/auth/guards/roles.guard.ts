import {
  Injectable,
  CanActivate,
  ExecutionContext,
  Req,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { UserRoleEnum } from 'src/utils/enums/roles.enum';
import { User } from 'src/user/entities/user.entity';
import { Repository } from 'typeorm';
import { ROLES_KEY } from '../../utils/decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async canActivate(context: ExecutionContext) {
    const requiredRoles = this.reflector.get<UserRoleEnum[]>(
      ROLES_KEY,
      context.getHandler(),
    );

    if (!requiredRoles) {
      return true;
    }

    //extract user and params  from request
    const { user } = context.switchToHttp().getRequest();
    const isAdmin = requiredRoles.some((role) => user.roles?.includes(role));
    console.log('is admin ? ' + isAdmin);

    if (isAdmin) {
      return true;
    }

    const { params } = context.switchToHttp().getRequest();
    const reqId = user.userId;
    const checkId = params.id;

    const targetData = await this.userRepository
      .createQueryBuilder('user')
      .where('user.id = :checkId', { checkId })
      .getOne();
    if (!targetData) {
      throw new UnauthorizedException('Introuvable');
    }

    const isOwner = reqId === targetData.id;
    if (isOwner) {
      return true;
    }

    throw new UnauthorizedException(
      "Vous n'avez pas le droit d'effectuer cette action",
    );
  }
}
