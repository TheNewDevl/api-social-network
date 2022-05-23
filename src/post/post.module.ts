import { Module } from '@nestjs/common';
import { PostService } from './post.service';
import { PostController } from './post.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostRepository } from '../repositories/post.repository';
import { UserRepository } from 'src/repositories/user.repository';
import { CommentRepository } from 'src/repositories/comment.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      PostRepository,
      UserRepository,
      CommentRepository,
    ]),
  ],
  controllers: [PostController],
  providers: [PostService],
})
export class PostModule {}
