import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CommentRepository } from 'src/repositories/comment.repository';
import { User } from 'src/user/entities/user.entity';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';

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
      });
      const savedComment = await this.commentRepository.saveComment(newComment);
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
      return comments;
    } catch (error) {
      throw error;
    }
  }

  async update(id: string, updateCommentDto: UpdateCommentDto) {
    try {
      await this.commentRepository.updateById(id, updateCommentDto);
      return updateCommentDto;
    } catch (error) {
      throw error;
    }
  }

  async remove(id: string) {
    try {
      await this.commentRepository.deleteComment(id);
      return { message: 'Publication supprimée !' };
    } catch (error) {
      throw error;
    }
  }
}
