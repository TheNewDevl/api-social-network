import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { AuthService } from 'src/auth/auth.service';

@Controller('user')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly authService: AuthService
  ) { }

  @Post('signup')
  signUp(@Body() createUserDto: CreateUserDto) {
    return this.userService.signUp(createUserDto);
  }

  @Post('login')
  login(@Body() loginData: LoginUserDto) {
    return this.authService.validateUser(loginData)
  }

  @Delete(':username')
  deleteUser(@Param() username: string) {
    return this.userService.deleteUser(username)
  }

  //test guards
  @Get()
  @UseGuards(JwtAuthGuard)
  getAll() {
    return this.userService.findAll()
  }
}
