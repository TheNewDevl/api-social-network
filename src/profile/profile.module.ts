import { Module } from '@nestjs/common';
import { ProfileService } from './profile.service';
import { ProfileController } from './profile.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProfileRepository } from 'src/repositories/profile.repository';
import { UserRepository } from 'src/repositories/user.repository';
import { PostRepository } from 'src/repositories/post.repository';
import { CommentRepository } from 'src/repositories/comment.repository';
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import {
  customFileName,
  fileFilter,
  limits,
} from 'src/utils/config/multerConfig';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ProfileRepository,
      UserRepository,
      PostRepository,
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
  controllers: [ProfileController],
  providers: [ProfileService, Repository],
})
export class ProfileModule {}
