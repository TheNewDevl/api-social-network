import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { AuthService } from 'src/auth/auth.service';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/roles.decorator';
import { UserRoleEnum } from 'src/enums/roles.enum';

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
    return this.authService.loginUser(loginData)
  }

  @Delete(':username')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRoleEnum.ADMIN)
  deleteUser(@Param() username: string) {
    return this.userService.deleteUser(username)
  }


  @Get()
  @UseGuards(JwtAuthGuard)
  getAll() {
    return this.userService.findAll()
  }
}
