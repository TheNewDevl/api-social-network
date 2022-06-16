import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../app.module';
import { CreateUserDto } from 'src/user/dto/create-user.dto';
import { LoginUserDto } from 'src/user/dto/login-user.dto';
import * as cookieParser from 'cookie-parser';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.use(cookieParser());
    app.useGlobalPipes(
      new ValidationPipe({
        forbidNonWhitelisted: true,
      }),
    );
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('AUTH MODULE', () => {
    const login = async (credentials: LoginUserDto) => {
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send(credentials);
      return response;
    };
    const user1: CreateUserDto = {
      email: 'test@test.com',
      username: 'username',
      password: 'Azerty0.',
    };

    describe('/signup', () => {
      it('should return succes message', () => {
        return request(app.getHttpServer())
          .post('/auth/signup')
          .send(user1)
          .expect(201)
          .expect({ message: 'Utilisateur créé avec succes' });
      });

      it('should throw conflic error pass existing username ', async () => {
        const response = await request(app.getHttpServer())
          .post('/auth/signup')
          .send({
            email: 'test2@test.com',
            username: 'username',
            password: 'Azerty0.',
          })
          .expect(409);
        expect(response.body.message).toEqual(
          "Email ou nom d'utilisateur déjà utilisé",
        );
      });

      it('should throw conflic error pass existing email ', async () => {
        const response = await request(app.getHttpServer())
          .post('/auth/signup')
          .send({
            email: 'test@test.com',
            username: 'username2',
            password: 'Azerty0.',
          })
          .expect(409);
        expect(response.body.message).toEqual(
          "Email ou nom d'utilisateur déjà utilisé",
        );
      });

      it('should throw 400 passing not strong password ', async () => {
        const response = await request(app.getHttpServer())
          .post('/auth/signup')
          .send({
            email: 'test@test.com',
            username: 'username2',
            password: 'aaaaaaaaa',
          })
          .expect(400);
        expect(response.body.message).toEqual([
          'Mot de passe invalide ! Doit contenir au moins 8 caractères, une majuscule, une minuscule, un chiffre et un caractère spécial (.-,)',
        ]);
      });
      it('should throw 400 passing invalid email ', async () => {
        const response = await request(app.getHttpServer())
          .post('/auth/signup')
          .send({
            email: 'testtest.com',
            username: 'username2',
            password: 'Azerty0.',
          })
          .expect(400);
        expect(response.body.message).toEqual(['email must be an email']);
      });
      it('should throw 400 passing invalid username ', () => {
        return request(app.getHttpServer())
          .post('/auth/signup')
          .send({
            email: 'test@test.com',
            username: 'us.',
            password: 'Azerty0.',
          })
          .expect(400);
      });

      it('should create an admin user', async () => {
        request(app.getHttpServer()).post('/auth/signup').send({
          email: 'admin@groupomania.com',
          username: 'adim',
          password: 'Azerty0.',
        });
      });
    });

    describe('LOGIN', () => {
      it('should return message and loged user', async () => {
        const response = await request(app.getHttpServer())
          .post('/auth/login')
          .send(user1)
          .expect(201);
        expect(response.body).toEqual({
          message: 'Identification réussie',
          user: {
            id: expect.any(String),
            username: 'username',
            roles: 'user',
            hasProfile: 0,
            token: expect.any(String),
          },
        });
      });

      it('should return error passing incorrect password', () => {
        return request(app.getHttpServer())
          .post('/auth/login')
          .send({
            email: 'test@test.com',
            username: 'username',
            password: 'wrongpassword',
          })
          .expect(404)
          .expect((res) =>
            expect(res.body.message).toEqual(
              'Mot de passe ou username incorrects. Veuillez vérifier vos identifiants',
            ),
          );
      });

      it('should return error passing inexisting username', () => {
        return request(app.getHttpServer())
          .post('/auth/login')
          .send({
            email: 'test@test.com',
            username: 'usernameee',
            password: 'wrongpassword',
          })
          .expect(404)
          .expect((res) =>
            expect(res.body.message).toEqual('Utilisateur introuvable'),
          );
      });

      it('set cookie header should be defined', () => {
        return request(app.getHttpServer())
          .post('/auth/login')
          .send(user1)
          .expect((res) => expect(res.header['set-cookie']).toBeDefined());
      });
    });

    describe('refresh', () => {
      it('should return 200 & new access token', async () => {
        const response = await login(user1);
        const cookie = response.headers['set-cookie'];

        return request(app.getHttpServer())
          .get('/auth/refresh')
          .set('Cookie', cookie)
          .expect(200)
          .expect((res) =>
            expect(res.body).toEqual({
              message: 'Identification réussie',
              user: {
                hasProfile: 0,
                id: expect.any(String),
                roles: 'user',
                token: expect.any(String),
                username: 'username',
              },
            }),
          );
      });

      it('should return 401', async () => {
        const cookie = ['roizjrehoigejrhre'];
        return request(app.getHttpServer())
          .get('/auth/refresh')
          .set('Cookie', cookie)
          .expect(401);
      });
      it('should return 404', async () => {
        return request(app.getHttpServer())
          .get('/auth/refresh')
          .set('Cookie', [
            'jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImVjMDY5ZDc2LTRmODQtNGE1My05ZmU4LWU5N2ViMjY4ZDYwYiIsInVzZXJuYW1lIjoidXNlcm5hbWUiLCJyb2xlcyI6InVzZXIiLCJpYXQiOjE2NTUzNzIwMzAsImV4cCI6MTY1NTQ1ODQzMH0.6nJIeS-jK5kVBiT-q32HAXvr3fMyp96BOj17h_MS7t4; Max-Age=86400; Path=/; Expires=Fri, 17 Jun 2022 09:33:50 GMT; HttpOnly',
          ])
          .expect(404);
      });

      it('should throw error because compare fail ', async () => {
        const response = await login(user1);
        const cookie = response.headers['set-cookie'];

        const logout = await request(app.getHttpServer())
          .get('/auth/logout')
          .set('Cookie', cookie);

        await request(app.getHttpServer())
          .get('/auth/refresh')
          .set('Cookie', cookie)
          .expect(401)
          .expect((res) =>
            expect(res.body.message).toEqual("Ce token ne t'appartient pas ! "),
          );
      });
    });

    describe('logout', () => {
      it('should return 200 if token is valid but not correspond to any user ', async () => {
        await login(user1);
        return request(app.getHttpServer())
          .get('/auth/logout')
          .set('Cookie', [
            'jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImVjMDY5ZDc2LTRmODQtNGE1My05ZmU4LWU5N2ViMjY4ZDYwYiIsInVzZXJuYW1lIjoidXNlcm5hbWUiLCJyb2xlcyI6InVzZXIiLCJpYXQiOjE2NTUzNzIwMzAsImV4cCI6MTY1NTQ1ODQzMH0.6nJIeS-jK5kVBiT-q32HAXvr3fMyp96BOj17h_MS7t4; Max-Age=86400; Path=/; Expires=Fri, 17 Jun 2022 09:33:50 GMT; HttpOnly',
          ])
          .expect(200)
          .expect((res) => expect(res.body).toEqual({}));
      });
      it('should return success msg', async () => {
        const response = await login(user1);
        const cookie = response.headers['set-cookie'];
        return request(app.getHttpServer())
          .get('/auth/logout')
          .set('Cookie', cookie)
          .expect(200)
          .expect((res) =>
            expect(res.body).toEqual({ message: 'logout effectué' }),
          );
      });
    });
  });
});
