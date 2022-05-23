import { BadRequestException } from '@nestjs/common';
import { Comment } from 'src/comments/entities/comment.entity';
import { EntityRepository, Repository } from 'typeorm';

@EntityRepository(Comment)
export class CommentRepository extends Repository<Comment> {
  async saveComment(newComment: Comment) {
    const comment = await this.save(newComment);
    if (!comment) {
      throw new BadRequestException('Echec de la création du commentaire !');
    }
    return comment;
  }

  //set user relation
  async setUserRelation(savedComment: Comment, userId: string) {
    await this.createQueryBuilder()
      .relation(Comment, 'user')
      .of(savedComment)
      .set(userId);
  }

  /**Check if post exist and set relation */
  async setPostRelation(savedComment: Comment, postId: string) {
    //check if post really exists in DB
    const post = this.manager
      .createQueryBuilder()
      .from('Post', 'post')
      .where('post.id = :id', { id: postId });
    if (!post) {
      throw new BadRequestException('Publication associée introuvable');
    }
    await this.createQueryBuilder()
      .relation(Comment, 'post')
      .of(savedComment)
      .set(postId);
  }

  async findPaginatedCommentByPost(
    offset: number,
    limit: number,
    postId: string,
  ) {
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
    if (!comments) {
      throw new BadRequestException(
        'Il y a eu une erreur lors de la récupération des commmentaires.',
      );
    }
    return comments;
  }

  /**update comment using comment id */
  async updateById(commentId: string, comment: Partial<Comment>) {
    const updatedComment = await this.update({ id: commentId }, comment);
    if (!updatedComment) {
      throw new BadRequestException('Erreur durant la mise à jour !');
    }
    console.log(updatedComment);

    return updatedComment;
  }
  /** delete comment using comment id  */
  async deleteComment(commentId: string) {
    const deletion = await this.delete({ id: commentId });
    if (deletion.affected === 0) {
      throw new BadRequestException('Suppression du post impossible');
    }
  }
}
