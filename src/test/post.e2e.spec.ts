import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as cookieParser from 'cookie-parser';
import { rmSync } from 'fs';
import { CreateCommentDto } from 'src/comments/dto/create-comment.dto';
import { CreatePostDto } from 'src/post/dto/create-post.dto';
import { LikePostDto } from 'src/post/dto/like-post.dto';
import { UpdatePostDto } from 'src/post/dto/update-post.dto';
import { CreateUserDto } from 'src/user/dto/create-user.dto';
import { LoginUserDto } from 'src/user/dto/login-user.dto';
import * as request from 'supertest';
import { AppModule } from '../app.module';

console.log = jest.fn();

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
    await app.close();
    rmSync(`testImages`, { recursive: true });
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
      text: 'this is the first post',
    };
    const createPostDto2: CreatePostDto = {
      text: 'this is the second post',
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
                text: 'this is the first post',
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
          .field('text', createPostDto2.text)
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
                text: 'this is the second post',
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
          .attach('file', `${__dirname}/validTestFile.jpeg`)
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

    describe('FIND ALL', () => {
      it('should return 404 if missing query params', async () => {
        await request(app.getHttpServer())
          .get('/posts')
          .set('Authorization', `Bearer ${tokenUser1}`)
          .expect(400)
          .expect((res) =>
            expect(res.body.message).toEqual(
              'Il y a eu une erreur lors du chargement des données.',
            ),
          );
      });
      it('should return the last post', async () => {
        await request(app.getHttpServer())
          .get('/posts/')
          .query({ offset: 0 })
          .query({ limit: 1 })
          .set('Authorization', `Bearer ${tokenUser1}`)
          .expect(200)
          .expect((res) =>
            expect(res.body).toEqual([
              [
                {
                  commentsCount: 0,
                  createdAt: expect.any(String),
                  id: expect.any(String),
                  image: null,
                  likes: [],
                  text: 'this is the first post',
                  user: {
                    id: expect.any(String),
                    profile: null,
                    username: 'username',
                  },
                },
              ],
              2,
            ]),
          );
      });
      it('should return the oldest post', async () => {
        await request(app.getHttpServer())
          .get('/posts/')
          .query({ offset: 1 })
          .query({ limit: 1 })
          .set('Authorization', `Bearer ${tokenUser1}`)
          .expect(200)
          .expect((res) =>
            expect(res.body).toEqual([
              [
                {
                  commentsCount: 0,
                  createdAt: expect.any(String),
                  id: expect.any(String),
                  image: expect.any(String),
                  likes: [],
                  text: 'this is the second post',
                  user: {
                    id: expect.any(String),
                    profile: null,
                    username: 'username2',
                  },
                },
              ],
              2,
            ]),
          );
      });
      it('should return only the passed user posts', async () => {
        await request(app.getHttpServer())
          .get('/posts/')
          .query({ offset: 0 })
          .query({ limit: 0 })
          .query({ user: await userLogged1.body.user.id })
          .set('Authorization', `Bearer ${tokenUser1}`)
          .expect(200)
          .expect((res) =>
            expect(res.body).toEqual([
              [
                {
                  commentsCount: 0,
                  createdAt: expect.any(String),
                  id: expect.any(String),
                  image: null,
                  likes: [],
                  text: expect.any(String),
                  user: {
                    id: expect.any(String),
                    profile: null,
                    username: 'username',
                  },
                },
              ],
              1,
            ]),
          );
      });
      it('should throw error', async () => {
        await request(app.getHttpServer())
          .get('/posts/')
          .query({ user: await userLogged1.body.user.id })
          .set('Authorization', `Bearer ${tokenUser1}`)
          .expect(400);
      });
    });
    describe('FIND ONE', () => {
      it('return the post', async () => {
        await request(app.getHttpServer())
          .get(`/posts/${await post1.body.post.id}`)
          .set('Authorization', `Bearer ${tokenUser1}`)
          .expect(200)
          .expect(async (res) =>
            expect(res.body).toEqual({
              createdAt: expect.any(String),
              deletedAt: null,
              id: expect.any(String),
              image: null,
              text: expect.any(String),
              updatedAt: expect.any(String),
              userId: await userLogged1.body.user.id,
            }),
          );
      });
      it('should throw 401', async () => {
        await request(app.getHttpServer())
          .get(`/posts/${await post1.body.post.id}`)
          .expect(401);
      });
      it('should throw 404', async () => {
        await request(app.getHttpServer())
          .get(`/posts/blablaid`)
          .set('Authorization', `Bearer ${tokenUser1}`)
          .expect(404)
          .expect((res) =>
            expect(res.body.message).toEqual('Publication introuvable !'),
          );
      });
    });

    describe('UPDATE', () => {
      const updatedPostDto: UpdatePostDto = {
        text: 'this is the updated text',
      };
      it('should return updated post', async () => {
        await request(app.getHttpServer())
          .patch(`/posts/${await post1.body.post.id}`)
          .set('Authorization', `Bearer ${tokenUser1}`)
          .send(updatedPostDto)
          .expect(200)
          .expect((res) =>
            expect(res.body).toEqual({
              createdAt: expect.any(String),
              deletedAt: null,
              id: expect.any(String),
              image: null,
              text: 'this is the updated text',
              updatedAt: expect.any(String),
              userId: expect.any(String),
            }),
          );
      });
      it('should throw 403', async () => {
        await request(app.getHttpServer())
          .patch(`/posts/${await post1.body.post.id}`)
          .set('Authorization', `Bearer ${tokenUser2}`)
          .send(updatedPostDto)
          .expect(403);
      });
      it('should throw 401', async () => {
        await request(app.getHttpServer())
          .patch(`/posts/${await post1.body.post.id}`)
          .send(updatedPostDto)
          .expect(401);
      });
      it('should throw 400', async () => {
        await request(app.getHttpServer())
          .patch(`/posts/${await post1.body.post.id}`)
          .set('Authorization', `Bearer ${tokenUser1}`)
          .send({ text: '' })
          .expect(400);
      });
      it('should return updated post ( file)', async () => {
        await request(app.getHttpServer())
          .patch(`/posts/${await post2.body.post.id}`)
          .set('Authorization', `Bearer ${tokenUser2}`)
          .field('text', updatedPostDto.text)
          .attach('file', `${__dirname}/validTestFile.jpeg`)
          .expect(200)
          .expect((res) =>
            expect(res.body).toEqual({
              createdAt: expect.any(String),
              deletedAt: null,
              id: expect.any(String),
              image: expect.any(String),
              text: 'this is the updated text',
              updatedAt: expect.any(String),
              userId: expect.any(String),
            }),
          );
      });
    });

    describe('LIKES', () => {
      const like: LikePostDto = {
        like: 'like',
      };
      const unlike: LikePostDto = {
        like: 'unlike',
      };
      it('should return 401', async () => {
        await request(app.getHttpServer())
          .patch(`/posts/likes/${await post1.body.post.id}`)
          .send(like)
          .expect(401);
      });
      it('should return success msg ', async () => {
        await request(app.getHttpServer())
          .patch(`/posts/likes/${await post1.body.post.id}`)
          .set('Authorization', `Bearer ${tokenUser2}`)
          .send(like)
          .expect(200)
          .expect((res) => expect(res.body.message).toEqual('Like enregistré'));
      });
      it('should throw 409 ', async () => {
        await request(app.getHttpServer())
          .patch(`/posts/likes/${await post1.body.post.id}`)
          .set('Authorization', `Bearer ${tokenUser2}`)
          .send(like)
          .expect(409);
      });
      it('should unlike ', async () => {
        await request(app.getHttpServer())
          .patch(`/posts/likes/${await post1.body.post.id}`)
          .set('Authorization', `Bearer ${tokenUser2}`)
          .send(unlike)
          .expect(200)
          .expect((res) => expect(res.body.message).toEqual('Like supprimé'));
      });
      it('should throw 400 ', async () => {
        await request(app.getHttpServer())
          .patch(`/posts/likes/${await post1.body.post.id}`)
          .set('Authorization', `Bearer ${tokenUser2}`)
          .send({ like: 'blabla' })
          .expect(400);
      });
      it('should throw 400 ', async () => {
        await request(app.getHttpServer())
          .patch(`/posts/likes/blablaiddd`)
          .set('Authorization', `Bearer ${tokenUser2}`)
          .send({ like: 'like' })
          .expect(400)
          .expect((res) =>
            expect(res.body.message).toEqual("Veuillez vérifier l'id"),
          );
      });
    });

    describe('COMMENTS e2e', () => {
      const commmentDto: CreateCommentDto = {
        text: 'this is my comment',
        postId: '',
      };
      let comment1;
      let comment2;

      describe('create', () => {
        it('should return 201 and the created comment', async () => {
          commmentDto.postId = await post1.body.post.id;
          comment1 = await request(app.getHttpServer())
            .post(`/comment`)
            .set('Authorization', `Bearer ${tokenUser2}`)
            .send(commmentDto)
            .expect(201)
            .expect((res) =>
              expect(res.body).toEqual({
                createdAt: expect.any(String),
                id: expect.any(String),
                post: { id: expect.any(String) },
                text: 'this is my comment',
                user: {
                  id: expect.any(String),
                  username: 'username2',
                },
              }),
            );
          comment2 = await request(app.getHttpServer())
            .post(`/comment`)
            .set('Authorization', `Bearer ${tokenUser2}`)
            .send(commmentDto);
        });
        it('should  throw 400', async () => {
          commmentDto.postId = 'blablaid';
          await request(app.getHttpServer())
            .post(`/comment`)
            .set('Authorization', `Bearer ${tokenUser2}`)
            .send(commmentDto)
            .expect(400)
            .expect((res) =>
              expect(res.body.message).toEqual(
                'Publication associée introuvable.',
              ),
            );
        });
        it('should  throw 401', async () => {
          commmentDto.postId = await post1.body.post.id;
          await request(app.getHttpServer())
            .post(`/comment`)
            .send(commmentDto)
            .expect(401);
        });
        it('should  throw 400', async () => {
          commmentDto.postId = await post1.body.post.id;
          await request(app.getHttpServer())
            .post(`/comment`)
            .set('Authorization', `Bearer ${tokenUser2}`)
            .send({ text: '' })
            .expect(400);
        });
      });

      describe('find all by post', () => {
        it('should return data', async () => {
          await request(app.getHttpServer())
            .get(`/comment/post/${await post1.body.post.id}`)
            .set('Authorization', `Bearer ${tokenUser2}`)
            .query({ offset: 0 })
            .query({ limit: 1 })
            .expect(200)
            .expect((res) =>
              expect(res.body).toEqual({
                comments: [
                  [
                    {
                      createdAt: expect.any(String),
                      id: expect.any(String),
                      post: { id: expect.any(String) },
                      text: 'this is my comment',
                      user: {
                        id: expect.any(String),
                        profile: null,
                        username: 'username2',
                      },
                    },
                  ],
                  2,
                ],
              }),
            );
        });
        it('should return data', async () => {
          await request(app.getHttpServer())
            .get(`/comment/post/${await post1.body.post.id}`)
            .set('Authorization', `Bearer ${tokenUser2}`)
            .expect(400)
            .expect((res) =>
              expect(res.body.message).toEqual(
                'Il y a eu une erreur lors de la récupération des commmentaires.',
              ),
            );
        });
        it('should throw 401', async () => {
          await request(app.getHttpServer())
            .get(`/comment/post/${await post1.body.post.id}`)
            .expect(401);
        });
      });

      describe('uptdate', () => {
        it('should return data', async () => {
          await request(app.getHttpServer())
            .patch(`/comment/${await comment1.body.id}`)
            .set('Authorization', `Bearer ${tokenUser2}`)
            .send({ text: 'updatedText' })
            .expect(200)
            .expect((res) =>
              expect(res.body).toEqual({
                id: expect.any(String),
                text: 'updatedText',
              }),
            );
        });
        it('should throw 404', async () => {
          await request(app.getHttpServer())
            .patch(`/comment/blablaid`)
            .set('Authorization', `Bearer ${tokenUser2}`)
            .send({ text: 'updatedText' })
            .expect(404);
        });
        it('should throw 403', async () => {
          await request(app.getHttpServer())
            .patch(`/comment/${await comment1.body.id}`)
            .set('Authorization', `Bearer ${tokenUser1}`)
            .send({ text: 'updatedText' })
            .expect(403);
        });
      });

      describe('remove', () => {
        it('should throw 403', async () => {
          await request(app.getHttpServer())
            .delete(`/comment/${await comment1.body.id}`)
            .set('Authorization', `Bearer ${tokenUser1}`)
            .send({ text: 'updatedText' })
            .expect(403);
        });
        it('should throw 404', async () => {
          await request(app.getHttpServer())
            .delete(`/comment/blablaid`)
            .set('Authorization', `Bearer ${tokenUser2}`)
            .send({ text: 'updatedText' })
            .expect(404);
        });
        it('should delete comment ', async () => {
          await request(app.getHttpServer())
            .delete(`/comment/${await comment1.body.id}`)
            .set('Authorization', `Bearer ${tokenUser2}`)
            .send({ text: 'updatedText' })
            .expect(200);
        });
      });
    });

    /* describe('REMOVE', () => {
      it('should throw 403', async () => {
        await request(app.getHttpServer())
          .delete(`/posts/${await post1.body.post.id}`)
          .set('Authorization', `Bearer ${tokenUser2}`)
          .expect(403);
      });
      it('should delete the post ', async () => {
        await request(app.getHttpServer())
          .delete(`/posts/${await post1.body.post.id}`)
          .set('Authorization', `Bearer ${tokenUser1}`)
          .expect(200);
      });
      it('should throw 404 ', async () => {
        await request(app.getHttpServer())
          .delete(`/posts/blablaid`)
          .set('Authorization', `Bearer ${tokenUser1}`)
          .expect(404);
      });
    }); */
  });
});
