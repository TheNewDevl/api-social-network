import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { LoginUserDto } from 'src/user/dto/login-user.dto';
import * as bcrypt from 'bcrypt';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/user/entities/user.entity';
import { Repository } from 'typeorm';
import { CreateUserDto } from 'src/user/dto/create-user.dto';
import { UserRoleEnum } from 'src/utils/enums/roles.enum';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async signUp(createUserDto: CreateUserDto) {
    try {
      const { email, password, username } = createUserDto;
      const hash = await bcrypt.hash(password, 10);
      const user = this.userRepository.create({
        email: email,
        password: hash,
        username: username,
      });
      if (createUserDto.email === 'admin@groupomania.com') {
        user.roles = UserRoleEnum.ADMIN;
      }
      const dbUser = await this.userRepository.save(user);
      return { message: 'Utilisateur créé avec succes' };
    } catch (error) {
      throw new ConflictException("Email ou nom d'utilisateur déjà utilisé");
    }
  }

  async loginUser(loginData: LoginUserDto) {
    const { username, password } = loginData;

    //user can pass email or username to login
    const user = await this.userRepository
      .createQueryBuilder('user')
      .where('user.email = :username or user.username = :username', {
        username,
      })
      .getOne();
    if (!user) {
      throw new NotFoundException('Utilisateur introuvable');
    }

    //check password
    const isMatch = await bcrypt.compare(password, user.password);

    if (user && isMatch) {
      //Create payload token
      const payload = {
        id: user.id,
        username: user.username,
        roles: user.roles,
      };

      const token = this.jwtService.sign(payload);

      const { id, username, roles, hasProfile } = user;

      return {
        message: 'Identification réussie',
        user: {
          id,
          username,
          roles,
          hasProfile,
          token,
        },
      };
    }

    throw new NotFoundException(
      'Mot de passe ou username incorrects. Veuillez vérifier vos identifiants',
    );
  }
}
