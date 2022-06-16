import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../app.module';
import { CreateUserDto } from 'src/user/dto/create-user.dto';
import { LoginUserDto } from 'src/user/dto/login-user.dto';
import * as cookieParser from 'cookie-parser';

describe('AppController (e2e)', () => {
  let app: INestApplication;
  const user1: CreateUserDto = {
    email: 'test@test.com',
    username: 'username',
    password: 'Azerty0.',
  };
  const admin: CreateUserDto = {
    email: 'admin@groupomania.com',
    username: 'admin',
    password: 'Azerty0.',
  };
  const user2: CreateUserDto = {
    email: 'test2@test.com',
    username: 'username2',
    password: 'Azerty0.',
  };
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

    const signup = async (credentials: LoginUserDto) => {
      const response = await request(app.getHttpServer())
        .post('/auth/signup')
        .send(credentials);
      return response;
    };

    await signup(user1);
    await signup(admin);
    await signup(user2);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('USER MODULE (e2e)', () => {
    //helpers
    const login = async (credentials: LoginUserDto) => {
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send(credentials);
      return response;
    };

    describe('get all', () => {
      it('should throw unauthoriz', async () => {
        const response = await login(user1);
        const token = response.body.user.token;
        return request(app.getHttpServer())
          .get('/user')
          .set('Authorization', `Bearer ${token}`)
          .expect(401);
      });
      it('should return users array', async () => {
        const response = await login(admin);
        const token = response.body.user.token;
        return request(app.getHttpServer())
          .get('/user')
          .set('Authorization', `Bearer ${token}`)
          .expect(200)
          .expect((res) =>
            expect(res.body).toEqual([
              {
                createdAt: expect.any(String),
                deletedAt: null,
                email: 'test@test.com',
                hasProfile: 0,
                hashedRefreshToken: expect.any(String),
                id: expect.any(String),
                password: expect.any(String),
                roles: 'user',
                updatedAt: expect.any(String),
                username: 'username',
              },
              {
                createdAt: expect.any(String),
                deletedAt: null,
                email: 'admin@groupomania.com',
                hasProfile: 0,
                hashedRefreshToken: expect.any(String),
                id: expect.any(String),
                password: expect.any(String),
                roles: 'admin',
                updatedAt: expect.any(String),
                username: 'admin',
              },
              {
                createdAt: expect.any(String),
                deletedAt: null,
                email: 'test2@test.com',
                hasProfile: 0,
                hashedRefreshToken: null,
                id: expect.any(String),
                password: expect.any(String),
                roles: 'user',
                updatedAt: expect.any(String),
                username: 'username2',
              },
            ]),
          );
      });
    });

    describe('get One', () => {
      it('should throw unauthoriz', async () => {
        await login(user1);
        return request(app.getHttpServer()).get('/user').expect(401);
      });

      it('should return user without password and hashed token', async () => {
        const response = await login(user1);
        const token = response.body.user.token;
        const id = response.body.user.id;
        return request(app.getHttpServer())
          .get(`/user/${id}`)
          .set('Authorization', `Bearer ${token}`)
          .expect(200)
          .expect((res) =>
            expect(res.body).toEqual({
              createdAt: expect.any(String),
              deletedAt: null,
              email: 'test@test.com',
              hasProfile: 0,
              id: expect.any(String),
              roles: 'user',
              updatedAt: expect.any(String),
              username: 'username',
            }),
          );
      });
      it('should throw  not found', async () => {
        const response = await login(user1);
        const token = response.body.user.token;
        return request(app.getHttpServer())
          .get(`/user/blablaid`)
          .set('Authorization', `Bearer ${token}`)
          .expect(404);
      });
    });

    describe('delete', () => {
      let response;
      let token;
      let id;
      let response2;
      let token2;
      let id2;
      let response3;
      let tokenAdmin;
      beforeAll(async () => {
        response = await login(user1);
        token = response.body.user.token;
        id = response.body.user.id;
        response2 = await login(user2);
        token2 = response2.body.user.token;
        id2 = response2.body.user.id;
        response3 = await login(admin);
        tokenAdmin = response3.body.user.token;
      });
      it('should return uunauthorized if try to delete other user account', async () => {
        return request(app.getHttpServer())
          .delete(`/user/${id}`)
          .set('Authorization', `Bearer ${token2}`)
          .expect(403);
      });
      it('should throw not found ', async () => {
        return request(app.getHttpServer())
          .delete(`/user/iezgoihzouijh`)
          .set('Authorization', `Bearer ${token}`)
          .expect(404);
      });
      it('admin can delete accounts', async () => {
        return request(app.getHttpServer())
          .delete(`/user/${id}`)
          .set('Authorization', `Bearer ${tokenAdmin}`)
          .expect(200);
      });
      it('owner can delete account', async () => {
        return request(app.getHttpServer())
          .delete(`/user/${id2}`)
          .set('Authorization', `Bearer ${token2}`)
          .expect(200);
      });
    });
  });
});
