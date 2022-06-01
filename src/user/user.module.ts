import { Module } from '@nestjs/common';
import { UserService } from 'src/user/user.service';
import { UserController } from './user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';
import { UserRepository } from 'src/repositories/user.repository';
import { PostRepository } from 'src/repositories/post.repository';
import { CommentRepository } from 'src/repositories/comment.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserRepository,
      PostRepository,
      CommentRepository,
    ]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
  ],
  providers: [UserService],
  controllers: [UserController],
})
export class UserModule {}
