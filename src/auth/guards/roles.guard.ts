import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { UserRoleEnum } from 'src/utils/enums/roles.enum';
import { User } from 'src/user/entities/user.entity';
import { Repository } from 'typeorm';
import { ROLES_KEY } from '../../utils/decorators/roles.decorator';
import { Post } from 'src/post/entities/post.entity';
import { Comment } from 'src/comments/entities/comment.entity';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Post)
    private postRepository: Repository<Post>,
    @InjectRepository(Comment)
    private commentRepository: Repository<Comment>,
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

    const { params, route } = context.switchToHttp().getRequest();
    const tokenUserId = user.id;
    const paramId = params.id;

    console.log(route.path);
    console.log('token user : ', tokenUserId);
    console.log('param id request: ', paramId);

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
    }

    throw new UnauthorizedException(
      "Vous n'avez pas le droit d'effectuer cette action",
    );
  }
}
