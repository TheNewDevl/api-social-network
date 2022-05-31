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
        //Create payload token
        const payload = {
          id: user.id,
          username: user.username,
          roles: user.roles,
        };

        const token = this.jwtService.sign(payload);
        const refreshToken = this.jwtService.sign(payload, {
          secret: this.configService.get('REFRESH_TOKEN_KEY'),
          expiresIn: '1d',
        });

        //hash refresh token
        const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);
        //and save hash in db
        user.hashedRefreshToken = hashedRefreshToken;
        await this.userRepository.saveUser(user);

        const { id, username, roles, hasProfile } = user;

        response
          .cookie('jwt', refreshToken, this.cookieOptions)
          .cookie('id', user.id, this.cookieOptions);

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

  async refreshToken(req: Request, res: Response) {
    const cookies = req.cookies;
    if (!cookies?.jwt || !cookies?.id) {
      throw new BadRequestException('Refresh token ou id manuant');
    }
    const refreshToken = cookies.jwt;
    const userId = cookies.id;

    res.clearCookie('jtw', this.cookieOptions);
    res.clearCookie('id', this.cookieOptions);

    const dbUser = await this.userRepository.findOneUserById(userId);

    const decodedRefreshToken = await bcrypt.compare(
      refreshToken,
      dbUser.hashedRefreshToken,
    );

    if (!decodedRefreshToken) {
      throw new UnauthorizedException("Ce token ne t'appartient pas ! ");
    }

    const refTokenValidity = await this.jwtService.verify(
      refreshToken,
      this.configService.get('REFRESH_TOKEN_KEY'),
    );

    if (!refTokenValidity) {
      dbUser.hashedRefreshToken = null;
      await this.userRepository.saveUser(dbUser);
      throw new UnauthorizedException('Refresh Token invalide');
    }

    //Create payload token
    const payload = {
      id: dbUser.id,
      username: dbUser.username,
      roles: dbUser.roles,
    };

    const newRefreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get('REFRESH_TOKEN_KEY'),
      expiresIn: '1d',
    });
    const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);
    //and save hash in db
    dbUser.hashedRefreshToken = hashedRefreshToken;
    await this.userRepository.saveUser(dbUser);

    const accessToken = this.jwtService.sign(payload, {
      secret: this.configService.get('ACCESS_TOKEN_KEY'),
      expiresIn: this.configService.get('ACCESS_TOKEN_DURATION'),
    });

    res
      .cookie('jwt', refreshToken, this.cookieOptions)
      .cookie('id', dbUser.id, this.cookieOptions);

    return { accessToken };
  }

  async logout(req: Request, res: Response) {
    try {
      // if no jwt and id cookie, nothing to delete so return success
      const cookies = req.cookies;
      if (!cookies?.jwt || !cookies?.id) {
        return { message: 'Pas de contenu dans la requête' };
      }

      const userId = cookies.id;

      // if cant find the user, juste delete cookies and return success
      const dbUser = await this.userRepository.findOneUserById(userId);
      if (!dbUser) {
        res.clearCookie('jtw', this.cookieOptions);
        res.clearCookie('id', this.cookieOptions);
        return {};
      }

      // i dont check if cookie token and db hash cookie matches because even if the token and the db token do not match, as a security measure i assume that the token or account is compromised and i still delete the token in the cookies and in the DB
      dbUser.hashedRefreshToken = null;
      await this.userRepository.saveUser(dbUser);
      res.clearCookie('jtw', this.cookieOptions);
      res.clearCookie('id', this.cookieOptions);

      return { message: 'logout effectué' };
    } catch (error) {
      throw error;
    }
  }
}
