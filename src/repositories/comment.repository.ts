import { BadRequestException } from '@nestjs/common';
import { Comment } from 'src/comments/entities/comment.entity';
import { Post } from 'src/post/entities/post.entity';
import { EntityRepository, Repository } from 'typeorm';

@EntityRepository(Comment)
export class CommentRepository extends Repository<Comment> {
  //set user relation
  async setUserRelation(savedComment: Comment, userId: string) {
    await this.createQueryBuilder()
      .relation(Comment, 'user')
      .of(savedComment)
      .set(userId);
  }

  /**Check if post exist and set relation */
  async setPostRelation(savedComment: Comment, postId: string) {
    try {
      //check if post really exists in DB
      await this.manager.findOne(Post, {
        id: postId,
      });

      //set relation
      await this.createQueryBuilder()
        .relation(Comment, 'post')
        .of(savedComment)
        .set(postId);
    } catch (error) {
      throw new BadRequestException('Publication associée introuvable.', error);
    }
  }

  async findPaginatedCommentByPost(
    offset: number,
    limit: number,
    postId: string,
  ) {
    try {
      const comments = await this.createQueryBuilder('comment')
        .leftJoinAndSelect('comment.user', 'commentUser')
        .leftJoinAndSelect('commentUser.profile', 'userprofile')
        .leftJoinAndSelect('comment.post', 'post')
        .select([
          'comment.createdAt',
          'comment.text',
          'comment.id',
          'commentUser.id',
          'commentUser.username',
          'post.id',
          'userprofile.photo',
        ])
        .orderBy('comment.createdAt', 'DESC')
        .offset(offset)
        .limit(limit)
        .where(`comment.postId = :postId`, { postId })
        .getManyAndCount();
      return comments;
    } catch (error) {
      throw new BadRequestException(
        'Il y a eu une erreur lors de la récupération des commmentaires.',
        error,
      );
    }
  }
}
