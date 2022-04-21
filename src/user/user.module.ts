import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { User } from './entities/user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import * as dotenv from 'dotenv'
import { AuthService } from 'src/auth/auth.service';
dotenv.config()

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    PassportModule.register(
      { defaultStrategy: 'jwt' }
    ),
    JwtModule.register({
      secret: process.env.SECRET_KEY,
      signOptions: {
        expiresIn: 7200
      }
    })
  ],
  controllers: [UserController],
  providers: [UserService, AuthService],
  exports: [UserService]
})
export class UserModule { }
