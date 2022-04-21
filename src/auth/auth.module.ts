import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { UserModule } from '../user/user.module'
import { AuthService } from './auth.service';
import { JwtStrategyTest } from './strategies/jwt.strategy';
import * as dotenv from 'dotenv'
import { Repository } from 'typeorm';
dotenv.config()

@Module({
  imports: [
    Repository,
    UserModule,
    PassportModule,
    JwtModule.register({
      secret: process.env.SECRET_KEY,
      signOptions: {
        expiresIn: 7200
      }
    }),
  ],
  providers: [AuthService, JwtStrategyTest],
  exports: [AuthService],
})
export class AuthModule { }