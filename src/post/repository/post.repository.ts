import { BadRequestException, NotFoundException } from '@nestjs/common';
import { EntityRepository, Repository } from 'typeorm';
import { Post } from '../entities/post.entity';

@EntityRepository(Post)
export class PostRepository extends Repository<Post> {
  /** Get paginated posts including likes, comments couts, and user */
  async getAllPaginated(offset: number, limit: number) {
    const posts = await this.createQueryBuilder('post')
      .leftJoinAndSelect('post.user', 'user')
      .leftJoinAndSelect('user.profile', 'profile')
      .leftJoinAndSelect('post.likes', 'likes')
      .orderBy('post.createdAt', 'DESC')
      .select([
        'likes.id',
        'post.id',
        'post.text',
        'post.image',
        'post.createdAt',
        'user.id',
        'user.username',
        'profile.photo',
      ])
      .offset(offset)
      .limit(limit)
      .getManyAndCount();
    if (!posts) {
      throw new BadRequestException(
        'Il y a eu une erreur lors du chargement des données depuis le serveur',
      );
    }
    return posts;
  }

  /** Get one post using id post */
  async findOneByPostId(id: string) {
    const post = await this.findOne({ id: id });
    if (!post) {
      throw new NotFoundException('Publication introuvable !');
    }
    return post;
  }
}
