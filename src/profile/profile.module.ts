import { Module } from '@nestjs/common';
import { ProfileService } from './profile.service';
import { ProfileController } from './profile.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Profile } from './entities/profile.entity';
import { User } from 'src/user/entities/user.entity';
import { Repository } from 'typeorm';
import { Post } from 'src/post/entities/post.entity';
import { Comment } from 'src/comments/entities/comment.entity';
import { ProfileRepository } from 'src/repositories/profile.repository';
import { UserRepository } from 'src/repositories/user.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ProfileRepository,
      UserRepository,
      Profile,
      User,
      Post,
      Comment,
    ]),
  ],
  controllers: [ProfileController],
  providers: [ProfileService, Repository],
})
export class ProfileModule {}
