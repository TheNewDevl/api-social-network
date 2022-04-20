import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommentModule } from './comment/comment.module';
import { PostModule } from './post/post.module';
import { UserModule } from './user/user.module';
import { ProfileModule } from './profile/profile.module';
import dbConfig from './config/databaseConfig';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: dbConfig.type,
      host: dbConfig.host,
      port: dbConfig.port,
      username: dbConfig.username,
      password: dbConfig.password,
      database: dbConfig.name,
      entities: ["dist/**/*.entity{.ts,.js}"],
      logging: true,
      synchronize: true,
    }),
    CommentModule,
    PostModule,
    UserModule,
    ProfileModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule { }
