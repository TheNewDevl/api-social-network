import { Body, Controller, Post } from '@nestjs/common';
import { CreateUserDto } from 'src/user/dto/create-user.dto';
import { LoginUserDto } from 'src/user/dto/login-user.dto';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
    constructor(
        private authService: AuthService
    ) { }

    @Post('signup')
    signUp(@Body() createUserDto: CreateUserDto) {
        return this.authService.signUp(createUserDto);
    }

    @Post('login')
    login(@Body() loginData: LoginUserDto) {
        return this.authService.loginUser(loginData)
    }
}
