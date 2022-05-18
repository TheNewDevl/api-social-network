import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Post } from 'src/post/entities/post.entity';
import { User } from 'src/user/entities/user.entity';
import { Repository } from 'typeorm';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { Comment } from './entities/comment.entity';

@Injectable()
export class CommentService {
  constructor(
    @InjectRepository(Comment)
    private commentRepository: Repository<Comment>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Post)
    private postRepository: Repository<Post>,
  ) {}
  async create(createCommentDto: CreateCommentDto, user: Partial<User>) {
    try {
      //retrieve post to create relation
      const postDb = await this.postRepository.findOne({
        id: createCommentDto.postId,
      });
      if (!postDb) {
        throw new NotFoundException(
          'La publication que vous tentez de commenter semble introuvable',
        );
      }

      // retrieve user to create relation
      const userDb = await this.userRepository.findOne({ id: user.id });
      if (!userDb) {
        throw new NotFoundException(
          'La publication que vous tentez de commenter semble introuvable',
        );
      }

      //build new comment object
      const newComment = new Comment();
      newComment.text = createCommentDto.text;
      newComment.post = postDb;
      newComment.user = userDb;

      //save comment
      const db = await this.commentRepository.save(newComment);
      if (!db) {
        throw new BadRequestException(
          "il y a eu un problème lors de l'enregistrement de la publication",
        );
      }

      //build object to be returned
      const comment = {
        id: db.id,
        text: db.text,
        createdAt: db.createdAt,
        user: {
          username: db.user.username,
          id: db.user.id,
        },
        post: {
          id: db.post.id,
        },
      };
      console.log(comment);

      return comment;
    } catch (error) {
      throw error;
    }
  }

  async findAllByPost({ offset, limit }, postId: string) {
    console.log('offset : ', offset, 'limit : ', limit, 'postId : ', postId);
    try {
      const comments = await this.commentRepository
        .createQueryBuilder('comment')
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
        .offset(parseInt(offset))
        .limit(parseInt(limit))
        .where(`comment.postId = :postId`, { postId })
        .getManyAndCount();
      if (!comments) {
        throw new BadRequestException(
          'Il y a eu une erreur lors de la récupération des commmentaires.',
        );
      }
      return comments;
    } catch (error) {
      throw error;
    }
  }

  async update(id: string, updateCommentDto: UpdateCommentDto) {
    try {
      const updatedComment = await this.commentRepository.update(
        { id },
        { text: updateCommentDto.text },
      );
      return updateCommentDto;
    } catch (error) {
      throw error;
    }
  }

  async remove(id: string) {
    const deletion = await this.commentRepository.delete({ id });
    if (deletion.affected === 0) {
      throw new NotFoundException('Suppression du post impossible');
    }
    return { message: 'Publication supprimée !' };
  }
}
