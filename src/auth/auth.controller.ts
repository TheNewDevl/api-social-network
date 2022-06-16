import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { CreateUserDto } from 'src/user/dto/create-user.dto';
import { LoginUserDto } from 'src/user/dto/login-user.dto';
import { User } from 'src/user/entities/user.entity';
import { reqUser } from 'src/utils/decorators/user.decorator';
import { AuthService } from './auth.service';
import { JwtRefreshGuard } from './guards/jwt-refresh.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('signup')
  signUp(@Body() createUserDto: CreateUserDto) {
    return this.authService.signUp(createUserDto);
  }

  @Post('login')
  login(
    @Body() loginData: LoginUserDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    return this.authService.loginUser(loginData, response);
  }

  @UseGuards(JwtRefreshGuard)
  @Get('refresh')
  refreshToken(
    @Req() req: Request,
    @reqUser() user: Partial<User>,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.authService.refreshToken(req, res, user);
  }

  @UseGuards(JwtRefreshGuard)
  @Get('logout')
  logout(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
    @reqUser() user: Partial<User>,
  ) {
    return this.authService.logout(req, res, user);
  }
}
