import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommentModule } from './comments/comment.module';
import { PostModule } from './post/post.module';
import { UserModule } from './user/user.module';
import { ProfileModule } from './profile/profile.module';
import { AuthModule } from './auth/auth.module';
import dbConfig from './utils/config/databaseConfig';
import * as Joi from 'joi';
import { MiddlewareConsumer, NestModule } from '@nestjs/common';
import { LoggerMiddleware } from './utils/logger';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { User } from './user/entities/user.entity';
import { Comment } from './comments/entities/comment.entity';
import { Post } from './post/entities/post.entity';
import { Profile } from './profile/entities/profile.entity';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '../images'),
      renderPath: 'images',
      exclude: ['/api*'],
    }),
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        ACCESS_TOKEN_KEY: Joi.string().required(),
        ACCESS_TOKEN_DURATION: Joi.string().required(),
        REFRESH_TOKEN_KEY: Joi.string().required(),
        REFRESH_TOKEN_DURATION: Joi.string().required(),
      }),
    }),
    TypeOrmModule.forRootAsync({
      useFactory: async () => {
        if (
          process.env.NODE_ENV === 'test' ||
          process.env.NODE_ENV === 'custom'
        ) {
          return {
            type: 'sqlite',
            database: ':memory:',
            entities: [User, Comment, Post, Profile],
            synchronize: true,
          };
        }
        return {
          type: dbConfig.type,
          host: dbConfig.host,
          port: dbConfig.port,
          username: dbConfig.username,
          password: dbConfig.password,
          database: dbConfig.name,
          entities: ['dist/**/*.entity{.ts,.js}'],
          logging: true,
          synchronize: true,
        };
      },
    }),
    AuthModule,
    CommentModule,
    PostModule,
    UserModule,
    ProfileModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule implements NestModule {
  //(implements test module is test for logger)
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
