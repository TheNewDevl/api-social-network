import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { UserRoleEnum } from 'src/utils/enums/roles.enum';
import { ROLES_KEY } from '../../utils/decorators/roles.decorator';
import { UserRepository } from 'src/repositories/user.repository';
import { PostRepository } from 'src/repositories/post.repository';
import { CommentRepository } from 'src/repositories/comment.repository';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector /*     @InjectRepository(UserRepository)
    private userRepository: UserRepository,
    @InjectRepository(PostRepository)
    private postRepository: PostRepository,
    @InjectRepository(CommentRepository)
    private commentRepository: CommentRepository, */,
  ) {}

  async canActivate(
    context: ExecutionContext,
    requiredRoles = this.reflector.get<UserRoleEnum[]>(
      ROLES_KEY,
      context.getHandler(),
    ),
  ) {
    if (!requiredRoles) {
      return true;
    }

    //extract user and params  from request
    const { user } = context.switchToHttp().getRequest();
    const isAdmin = requiredRoles.some((role) => user.roles?.includes(role));
    if (isAdmin) {
      return true;
    }

    /*
    const { params, route } = context.switchToHttp().getRequest();
    const tokenUserId = user.id;
    const paramId = params.id;



    const checkProperty = async (repository, builderParam) => {
      const targetData = await repository
        .createQueryBuilder(builderParam)
        .leftJoinAndSelect(`${builderParam}.user`, 'user')
        .where(`${builderParam}.id = :id`, { id: paramId })
        .getOne();

      if (!targetData) {
        throw new NotFoundException(
          "Ressource introuvable, vous n'avez pas le droit d'effectuer cette action",
        );
      }
      if (tokenUserId === targetData.user.id) {
        return true;
      }
    };

     //posts routes checks
    if (route.path === '/api/posts/:id') {
      return await checkProperty(this.postRepository, 'post');
    }

    //comment routes checks
    if (route.path === '/api/comment/:id') {
      return await checkProperty(this.commentRepository, 'comment');
    }

    //user routes check
    if (route.path === '/api/user/:id') {
      const user = await this.userRepository
        .createQueryBuilder('user')
        .where('user.id = :id', { id: paramId })
        .getOne();
      if (!user) {
        throw new NotFoundException(
          "Ressource introuvable, vous n'avez pas le droit d'effectuer cette action",
        );
      }
      if (tokenUserId === user.id) {
        return true;
      }
    } */

    throw new UnauthorizedException(
      "Vous n'avez pas le droit d'effectuer cette action",
    );
  }
}
