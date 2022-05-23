import { Module } from '@nestjs/common';
import { ProfileService } from './profile.service';
import { ProfileController } from './profile.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProfileRepository } from 'src/repositories/profile.repository';
import { UserRepository } from 'src/repositories/user.repository';
import { PostRepository } from 'src/repositories/post.repository';
import { CommentRepository } from 'src/repositories/comment.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ProfileRepository,
      UserRepository,
      PostRepository,
      CommentRepository,
    ]),
  ],
  controllers: [ProfileController],
  providers: [ProfileService, Repository],
})
export class ProfileModule {}
