import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../app.module';
import { CreateUserDto } from 'src/user/dto/create-user.dto';
import { LoginUserDto } from 'src/user/dto/login-user.dto';
import * as cookieParser from 'cookie-parser';
import { rmSync } from 'fs';
import { Response } from 'express';
import { CreateProfileDto } from 'src/profile/dto/create-profile.dto';
import { CreatePostDto } from 'src/post/dto/create-post.dto';

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
  const userToDelete = {
    email: 'todelete@test.com',
    username: 'todelete',
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
    await signup(userToDelete);
  });

  afterAll(async () => {
    rmSync(`testImages`, { recursive: true });
    await app.close();
  });

  describe('POSTS MODULE (e2e)', () => {
    let userLogged1: request.Response;
    let userLogged2: request.Response;
    let adminLogged: request.Response;
    let tokenUser1: string;
    let tokenUser2: string;
    let tokenAdmin: string;
    let deletedUserToken: string;
    let post1: request.Response;
    let post2: request.Response;

    const createPostDto: CreatePostDto = {
      text: 'this is a test post',
    };
    it('log users', async () => {
      const login = async (credentials: LoginUserDto) => {
        const response = await request(app.getHttpServer())
          .post('/auth/login')
          .send(credentials);
        return response;
      };
      userLogged1 = await login(user1);
      userLogged2 = await login(user2);
      adminLogged = await login(admin);
      tokenUser1 = userLogged1.body.user.token;
      tokenUser2 = userLogged2.body.user.token;
      tokenAdmin = adminLogged.body.user.token;

      //log the user
      const loggedUser = await login(userToDelete);
      const accessToken = loggedUser.body.user.token;
      const id = loggedUser.body.user.id;
      //catch de cookie
      deletedUserToken = loggedUser.body.user.token;
      //delete the user
      await request(app.getHttpServer())
        .delete(`/user/${id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);
    });

    describe('CREATE', () => {
      it('should create post without file', async () => {
        post1 = await request(app.getHttpServer())
          .post('/posts/upload')
          .set('Authorization', `Bearer ${tokenUser1}`)
          .send(createPostDto)
          .expect(201)
          .expect((res) =>
            expect(res.body).toEqual({
              post: {
                commentsCount: 0,
                createdAt: expect.any(String),
                deletedAt: null,
                id: expect.any(String),
                image: null,
                likes: [],
                text: 'this is a test post',
                updatedAt: expect.any(String),
                user: {
                  id: expect.any(String),
                  profile: { photo: null },
                  username: 'username',
                },
                userId: expect.any(String),
              },
            }),
          );
      });

      it('should create post with a file', async () => {
        post2 = await request(app.getHttpServer())
          .post('/posts/upload')
          .set('Authorization', `Bearer ${tokenUser2}`)
          .field('text', createPostDto.text)
          .attach('file', `${__dirname}/validTestFile.jpeg`)
          .expect(201)
          .expect((res) =>
            expect(res.body).toEqual({
              post: {
                commentsCount: 0,
                createdAt: expect.any(String),
                deletedAt: null,
                id: expect.any(String),
                image: expect.any(String),
                likes: [],
                text: 'this is a test post',
                updatedAt: expect.any(String),
                user: {
                  id: expect.any(String),
                  profile: { photo: null },
                  username: 'username2',
                },
                userId: expect.any(String),
              },
            }),
          );
      });
      it('should throw error if cant find the user trying to post', async () => {
        return request(app.getHttpServer())
          .post('/posts/upload')
          .set('Authorization', `Bearer ${deletedUserToken}`)
          .field('text', createPostDto.text)
          .expect(404)
          .expect((res) =>
            expect(res.body.message).toEqual(
              'Utilisateur souhaitant effectuer la publication introuvable',
            ),
          );
      });
      it('should throw 401', async () => {
        return request(app.getHttpServer())
          .post('/posts/upload')
          .field('text', createPostDto.text)
          .expect(401);
      });
    });

    /* describe('FIND ALL', () => {});
    describe('FIND ONE', () => {});
    describe('UPDATE', () => {});
    describe('REMOVE', () => {});
    describe('LIKES', () => {}); */
  });
});
