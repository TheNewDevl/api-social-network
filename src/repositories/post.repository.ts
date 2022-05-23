import { BadRequestException, NotFoundException } from '@nestjs/common';
import { EntityRepository, Repository } from 'typeorm';
import { Post } from '../post/entities/post.entity';

@EntityRepository(Post)
export class PostRepository extends Repository<Post> {
  /** Save and return post in DB deleting user data */
  async savePost(post: Post) {
    const savedPost = await this.save(post);
    if (!savedPost) {
      throw new BadRequestException(
        'Il y a eu une erreur lors de la création de la publication',
      );
    }
    delete savedPost.user;
    return savedPost;
  }

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

    this.manager.query('SELECT COUNT(*) AS commentsCount, post_id FROM comments GROUP BY post_id WHERE post_id in (:postIdList)', {posts[0]});
   /*  for (const post of posts) {
      const test = await this.commentRepository
        .createQueryBuilder('comment')
        .where('comment.post = :post', { post: post.id })
        .getCount();
      post.commentsCount = test;
    }

    return [posts, countPosts]; */

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

/** Will return all posts with their user id and username */
/* async findAll({ limit, offset }) {
    try {
  

      for (const post of posts) {
        const test = await this.commentRepository
          .createQueryBuilder('comment')
          .where('comment.post = :post', { post: post.id })
          .getCount();
        post.commentsCount = test;
      }

      return [posts, countPosts];
    } catch (error) {
      console.log(error);
      throw new BadRequestException(
        'Il y a eu une erreur lors du chargement des données depuis le serveur',
      );
    }
  } */
