import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { EntityRepository, Repository } from 'typeorm';
import { Post } from '../post/entities/post.entity';

@EntityRepository(Post)
export class PostRepository extends Repository<Post> {
  /** Get paginated posts including likes, comments couts, and user */
  async getAllPaginated(offset: number, limit: number) {
    try {
      const [posts, countPosts] = await this.createQueryBuilder('post')
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

      //Join count comments for each post
      for (const post of posts) {
        const count = await this.manager
          .createQueryBuilder()
          .from('Comment', 'comment')
          .where('comment.post = :post', { post: post.id })
          .getCount();
        post.commentsCount = count;
      }
      return [posts, countPosts];
    } catch (error) {
      throw new BadRequestException(
        'Il y a eu une erreur lors du chargement des données.',
        error,
      );
    }
  }

  async getAllByUserPaginated(offset: number, limit: number, id: string) {
    try {
      const [posts, countPosts] = await this.createQueryBuilder('post')
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
        .where('post.userId = :id', { id: id })
        .getManyAndCount();

      //Join count comments for each post
      for (const post of posts) {
        const count = await this.manager
          .createQueryBuilder()
          .from('Comment', 'comment')
          .where('comment.post = :post', { post: post.id })
          .getCount();
        post.commentsCount = count;
      }
      return [posts, countPosts];
    } catch (error) {
      throw new BadRequestException(
        'Il y a eu une erreur lors du chargement des données.',
        error,
      );
    }
  }

  /** Get one post using id post */
  async findOneByPostId(id: string) {
    const post = await this.findOne({ id: id });
    if (!post) {
      throw new NotFoundException('Publication introuvable !');
    }
    return post;
  }

  async addLike(postId: string, userId: string) {
    try {
      await this.createQueryBuilder()
        .relation(Post, 'likes')
        .of(postId)
        .add(userId);
    } catch (error) {
      if (
        error.code === 'ER_DUP_ENTRY' ||
        String(error).includes('UNIQUE constraint failed')
      ) {
        throw new ConflictException('Vous avez déja liké cette publication.');
      } else {
        throw new BadRequestException("Veuillez vérifier l'id");
      }
    }
  }

  async removeLike(postId: string, userId: string) {
    await this.createQueryBuilder()
      .relation(Post, 'likes')
      .of(postId)
      .remove(userId);
  }
}
