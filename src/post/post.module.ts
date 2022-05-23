import { Module } from '@nestjs/common';
import { PostService } from './post.service';
import { PostController } from './post.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Post } from './entities/post.entity';
import { User } from 'src/user/entities/user.entity';
import { Comment } from 'src/comments/entities/comment.entity';
import { PostRepository } from './repository/post.repository';

@Module({
  imports: [TypeOrmModule.forFeature([PostRepository, Post, User, Comment])],
  controllers: [PostController],
  providers: [PostService],
})
export class PostModule {}
