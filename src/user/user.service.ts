import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from './entities/user.entity';
import * as bcrypt from 'bcrypt'
import { LoginUserDto } from './dto/login-user.dto';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService
  ) { }

  async signUp(createUserDto: CreateUserDto) {
    try {
      const { email, password, username } = createUserDto
      const hash = await bcrypt.hash(password, 10)
      const user = this.userRepository.create({
        email: email,
        password: hash,
        username: username
      })
      const dbUser = await this.userRepository.save(user)
      return { message: 'Utilisateur créé avec succes' }

    } catch (error) {

      throw new ConflictException('Email ou nom d\'utilisateur déjà utilisé')

    }
  }

  async login(loginData: LoginUserDto) {
    try {
      const { username, password } = loginData

      //user can pass email or username to login
      const user = await this.userRepository.createQueryBuilder('user')
        .where("user.email = :username or user.username = :username",
          { username }
        )
        .getOne()

      //check password
      const isMatch = await bcrypt.compare(password, user.password)

      //Create payload token
      const payload = {
        id: user.id,
        username: user.username,
        role: user.role
      }

      const token = this.jwtService.sign(payload)

      return { token }

    } catch (error) {

      console.log(error);
      throw new NotFoundException('Mot de passe ou username incorrects. Veuillez vérifier vos identifiants')

    }
  }
}
