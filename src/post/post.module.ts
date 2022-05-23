import { Module } from '@nestjs/common';
import { PostService } from './post.service';
import { PostController } from './post.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Post } from './entities/post.entity';
import { User } from 'src/user/entities/user.entity';
import { Comment } from 'src/comments/entities/comment.entity';
import { PostRepository } from '../repositories/post.repository';
import { UserRepository } from 'src/repositories/user.repository';
import { CommentRepository } from 'src/repositories/comment.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      PostRepository,
      UserRepository,
      CommentRepository,
      Post,
      User,
      Comment,
    ]),
  ],
  controllers: [PostController],
  providers: [PostService],
})
export class PostModule {}
