import { Module } from '@nestjs/common';
import { PostService } from './post.service';
import { PostController } from './post.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostRepository } from '../repositories/post.repository';
import { UserRepository } from 'src/repositories/user.repository';
import { CommentRepository } from 'src/repositories/comment.repository';
import { MulterModule } from '@nestjs/platform-express';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { diskStorage } from 'multer';
import {
  customFileName,
  fileFilter,
  limits,
} from 'src/utils/config/multerConfig';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      PostRepository,
      UserRepository,
      CommentRepository,
    ]),
    MulterModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        storage: diskStorage({
          destination:
            configService.get('NODE_ENV') === 'test'
              ? './testImages'
              : './images',
          filename: customFileName,
        }),
        fileFilter: fileFilter,
        limits: limits,
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [PostController],
  providers: [PostService],
})
export class PostModule {}
