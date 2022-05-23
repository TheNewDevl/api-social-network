import { Module } from '@nestjs/common';
import { CommentService } from './comment.service';
import { CommentController } from './comment.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommentRepository } from 'src/repositories/comment.repository';
import { PostRepository } from 'src/repositories/post.repository';
import { UserRepository } from 'src/repositories/user.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      CommentRepository,
      PostRepository,
      UserRepository,
    ]),
  ],
  controllers: [CommentController],
  providers: [CommentService],
})
export class CommentModule {}
