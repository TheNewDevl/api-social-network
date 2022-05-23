import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import * as dotenv from 'dotenv';
import { AuthService } from 'src/auth/auth.service';
import { UserRepository } from 'src/repositories/user.repository';
import { PostRepository } from 'src/repositories/post.repository';
import { CommentRepository } from 'src/repositories/comment.repository';
dotenv.config();

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserRepository,
      PostRepository,
      CommentRepository,
    ]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: process.env.SECRET_KEY,
      signOptions: {
        expiresIn: 7200,
      },
    }),
  ],
  controllers: [UserController],
  providers: [UserService, AuthService],
  exports: [UserService],
})
export class UserModule {}
