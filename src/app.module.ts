import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommentModule } from './comments/comment.module';
import { PostModule } from './post/post.module';
import { UserModule } from './user/user.module';
import { ProfileModule } from './profile/profile.module';
import { AuthModule } from './auth/auth.module';
import dbConfig from './utils/config/databaseConfig';

//test logger
import { MiddlewareConsumer, NestModule } from '@nestjs/common';

import { LoggerMiddleware } from './utils/logger';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { CommentRepository } from './repositories/comment.repository';
import { PostRepository } from './repositories/post.repository';
import { UserRepository } from './repositories/user.repository';
import { ProfileRepository } from './repositories/profile.repository';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '../images'),
      renderPath: 'images',
      exclude: ['/api*'],
    }),
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: dbConfig.type,
      host: dbConfig.host,
      port: dbConfig.port,
      username: dbConfig.username,
      password: dbConfig.password,
      database: dbConfig.name,
      entities: ['dist/**/*.entity{.ts,.js}'],
      logging: true,
      synchronize: true,
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
