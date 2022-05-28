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

    if (!posts) {
      throw new BadRequestException(
        'Il y a eu une erreur lors du chargement des données depuis le serveur',
      );
    }

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
  }

  /** Get one post using id post */
  async findOneByPostId(id: string) {
    const post = await this.findOne({ id: id });
    if (!post) {
      throw new NotFoundException('Publication introuvable !');
    }
    return post;
  }

  async deletePost(id: string) {
    const deletion = await this.delete({ id: id });
    if (deletion.affected === 0) {
      throw new BadRequestException('Suppression du post impossible');
    }
  }

  async addLike(postId: string, userId: string) {
    try {
      await this.createQueryBuilder()
        .relation(Post, 'likes')
        .of(postId)
        .add(userId);
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        throw new BadRequestException('Vous avez déja liké cette publication.');
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
