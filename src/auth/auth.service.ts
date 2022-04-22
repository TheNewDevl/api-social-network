import { Injectable, NotFoundException } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import { LoginUserDto } from 'src/user/dto/login-user.dto';
import * as bcrypt from 'bcrypt'

@Injectable()
export class AuthService {
    constructor(
        private readonly usersService: UserService,
        private jwtService: JwtService,
    ) { }

    async loginUser(loginData: LoginUserDto) {

        const { username, password } = loginData

        //user can pass email or username to login
        const user = await this.usersService.findOne(username)

        //check password
        const isMatch = await bcrypt.compare(password, user.password)

        if (user && isMatch) {
            //Create payload token
            const payload = {
                id: user.id,
                username: user.username,
                roles: user.roles
            }

            const token = this.jwtService.sign(payload)

            const { password, ...result } = user;

            return { result, token };
        }

        throw new NotFoundException('Mot de passe ou username incorrects. Veuillez vérifier vos identifiants')

    }
}