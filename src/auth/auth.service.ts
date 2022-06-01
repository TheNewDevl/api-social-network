import {
  BadRequestException,
  ConflictException,
  HttpStatus,
  Injectable,
  NotFoundException,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { LoginUserDto } from 'src/user/dto/login-user.dto';
import * as bcrypt from 'bcrypt';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateUserDto } from 'src/user/dto/create-user.dto';
import { UserRoleEnum } from 'src/utils/enums/roles.enum';
import { UserRepository } from 'src/repositories/user.repository';
import { ConfigService } from '@nestjs/config';
import { Request, Response } from 'express';
import { User } from 'src/user/entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(UserRepository)
    private userRepository: UserRepository,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  cookieOptions = {
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000, // one day
  };

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
      await this.userRepository.save(user);
      return { message: 'Utilisateur créé avec succes' };
    } catch (error) {
      throw new ConflictException("Email ou nom d'utilisateur déjà utilisé");
    }
  }

  async loginUser(loginData: LoginUserDto, response: Response) {
    try {
      const { username, password } = loginData;

      //user can pass email or username to login
      const user = await this.userRepository.findUserByUsername(username);

      //check password
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        throw new NotFoundException(
          'Mot de passe ou username incorrects. Veuillez vérifier vos identifiants',
        );
      }

      if (user && isMatch) {
        const token = this.getAccessToken(user);

        const refreshToken = this.getRefreshToken(user);
        //hash refresh token
        const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);
        //and save hash in db
        user.hashedRefreshToken = hashedRefreshToken;
        await this.userRepository.saveUser(user);

        const { id, username, roles, hasProfile } = user;

        response.cookie('jwt', refreshToken, this.cookieOptions);

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
    } catch (error) {
      throw error;
    }
  }

  async refreshToken(req: Request, res: Response, user: Partial<User>) {
    try {
      const refreshToken = req.cookies.jwt;

      const dbUser = await this.userRepository.findOneUserById(user.id);

      const decodedRefreshToken = await bcrypt.compare(
        refreshToken,
        dbUser.hashedRefreshToken,
      );

      if (!decodedRefreshToken) {
        res.clearCookie('jtw', this.cookieOptions);
        dbUser.hashedRefreshToken = '';
        this.userRepository.saveUser(dbUser);
        throw new UnauthorizedException("Ce token ne t'appartient pas ! ");
      }

      const newRefreshToken = this.getRefreshToken(dbUser);
      const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);

      //save new hashed refresh token in db
      dbUser.hashedRefreshToken = hashedRefreshToken;
      await this.userRepository.saveUser(dbUser);

      const accessToken = this.getAccessToken(dbUser);

      const { id, username, roles, hasProfile } = dbUser;

      res.cookie('jwt', newRefreshToken, this.cookieOptions);

      return {
        message: 'Identification réussie',
        user: {
          id,
          username,
          roles,
          hasProfile,
          token: accessToken,
        },
      };
    } catch (error) {
      throw error;
    }
  }

  async logout(req: Request, res: Response, user: Partial<User>) {
    try {
      console.log(user);

      // if no jwt and id cookie, nothing to delete so return success
      const cookies = req.cookies;
      if (!cookies?.jwt) {
        return { message: 'Pas de contenu dans la requête' };
      }

      // if cant find the user, juste delete cookies and return success
      const dbUser = await this.userRepository.findOneUserById(user.id);
      if (!dbUser) {
        res.clearCookie('jwt', this.cookieOptions);
        return {};
      }

      // i dont check if cookie token and db hash cookie matches because even if the token and the db token do not match, as a security measure i assume that the token or account is compromised and i still delete the token in the cookies and in the DB
      dbUser.hashedRefreshToken = null;
      await this.userRepository.saveUser(dbUser);
      res.clearCookie('jwt', this.cookieOptions);

      return { message: 'logout effectué' };
    } catch (error) {
      throw error;
    }
  }

  getRefreshToken(user: User) {
    try {
      const payload = {
        id: user.id,
        username: user.username,
        roles: user.roles,
      };

      const refreshToken = this.jwtService.sign(payload, {
        secret: this.configService.get('REFRESH_TOKEN_KEY'),
        expiresIn: this.configService.get('REFRESH_TOKEN_DURATION'),
      });
      return refreshToken;
    } catch (error) {
      throw error;
    }
  }

  getAccessToken(user: User) {
    const payload = {
      id: user.id,
      username: user.username,
      roles: user.roles,
    };
    const accessToken = this.jwtService.sign(payload, {
      secret: this.configService.get('ACCESS_TOKEN_KEY'),
      expiresIn: this.configService.get('ACCESS_TOKEN_DURATION'),
    });
    return accessToken;
  }
}
