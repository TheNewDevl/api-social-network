import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CommentRepository } from 'src/repositories/comment.repository';
import { User } from 'src/user/entities/user.entity';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { Comment } from './entities/comment.entity';

@Injectable()
export class CommentService {
  constructor(
    @InjectRepository(CommentRepository)
    private commentRepository: CommentRepository,
  ) {}
  async create(createCommentDto: CreateCommentDto, user: Partial<User>) {
    try {
      const newComment = this.commentRepository.create({
        text: createCommentDto.text,
        userId: user.id,
      });

      const savedComment = await this.commentRepository.save(newComment);
      //Set relations
      await this.commentRepository.setUserRelation(newComment, user.id);
      await this.commentRepository.setPostRelation(
        newComment,
        createCommentDto.postId,
      );

      //build object to be returned
      const comment = {
        id: savedComment.id,
        text: savedComment.text,
        createdAt: savedComment.createdAt,
        user: {
          username: user.username,
          id: user.id,
        },
        post: {
          id: createCommentDto.postId,
        },
      };
      return comment;
    } catch (error) {
      throw error;
    }
  }

  async findAllByPost({ offset, limit }, postId: string) {
    try {
      const comments = await this.commentRepository.findPaginatedCommentByPost(
        +offset,
        +limit,
        postId,
      );
      return { comments };
    } catch (error) {
      throw error;
    }
  }

  async update(comment: Partial<Comment>, updateCommentDto: UpdateCommentDto) {
    try {
      await this.commentRepository.update({ id: comment.id }, comment);
      const updatedComment = {
        text: updateCommentDto.text,
        id: comment.id,
      };
      return updatedComment;
    } catch (error) {
      throw error;
    }
  }

  async remove(comment: Comment) {
    try {
      await this.commentRepository.delete({ id: comment.id });
      return { message: 'Commentaire supprimée !' };
    } catch (error) {
      throw error;
    }
  }
}
