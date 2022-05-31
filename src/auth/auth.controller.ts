import { Body, Controller, Get, Post, Req, Res } from '@nestjs/common';
import { Request, response, Response } from 'express';
import { get } from 'http';
import { CreateUserDto } from 'src/user/dto/create-user.dto';
import { LoginUserDto } from 'src/user/dto/login-user.dto';
import { AuthService } from './auth.service';

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

  @Get('refresh')
  refreshToken(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    return this.authService.refreshToken(req, res);
  }

  @Get('logout')
  logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    return this.authService.logout(req, res);
  }
}
