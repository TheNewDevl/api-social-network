import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../app.module';
import { CreateUserDto } from 'src/user/dto/create-user.dto';
import { LoginUserDto } from 'src/user/dto/login-user.dto';
import * as cookieParser from 'cookie-parser';
import { CreateProfileDto } from 'src/profile/dto/create-profile.dto';
import { rmSync } from 'fs';
import { UpdateProfileDto } from 'src/profile/dto/update-profile.dto';

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
    rmSync(`testImages`, { recursive: true });
  });

  describe('PROFILE MODULE (e2e)', () => {
    //helpers
    const login = async (credentials: LoginUserDto) => {
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send(credentials);
      return response;
    };

    const profile1: CreateProfileDto = {
      firstName: 'firstName',
      lastName: 'lastname',
      bio: 'bio bio bio bio bio bio bio',
      photo: '',
    };

    describe('CREATE', () => {
      it('should return 201, and the created profile', async () => {
        const response = await login(user1);
        const token = response.body.user.token;
        return request(app.getHttpServer())
          .post('/profile')
          .set('Authorization', `Bearer ${token}`)
          .send(profile1)
          .expect((res) =>
            expect(res.body).toEqual({
              message: 'Profil sauvegardé',
              profile: {
                userId: expect.any(String),
                bio: 'bio bio bio bio bio bio bio',
                firstName: 'firstName',
                lastName: 'lastname',
                photo: '',
                deletedAt: null,
                createdAt: expect.any(String),
                updatedAt: expect.any(String),
                id: expect.any(String),
              },
            }),
          );
      });

      it('should throw 400 passing invalid bio', async () => {
        const response = await login(user1);
        const token = response.body.user.token;
        return request(app.getHttpServer())
          .post('/profile')
          .set('Authorization', `Bearer ${token}`)
          .send({
            firstName: 'firstName',
            lastName: 'lastname',
            bio: 'bio bio',
            photo: '',
          })
          .expect(400);
      });

      it('should throw 400 passing invalid firstname', async () => {
        const response = await login(user1);
        const token = response.body.user.token;
        return request(app.getHttpServer())
          .post('/profile')
          .set('Authorization', `Bearer ${token}`)
          .send({
            firstName: 'fi',
            lastName: 'lastname',
            bio: 'bio bio bio bio bio bio bio',
            photo: '',
          })
          .expect(400);
      });

      it('should throw 400 passing invalid lastname', async () => {
        const response = await login(user1);
        const token = response.body.user.token;
        return request(app.getHttpServer())
          .post('/profile')
          .set('Authorization', `Bearer ${token}`)
          .send({
            firstName: 'firstname',
            lastName: '',
            bio: 'bio bio bio bio bio bio bio',
            photo: '',
          })
          .expect(400);
      });

      it('should throw conflic', async () => {
        const response = await login(user1);
        const token = response.body.user.token;
        return request(app.getHttpServer())
          .post('/profile')
          .set('Authorization', `Bearer ${token}`)
          .field('firstName', JSON.stringify(profile1.firstName))
          .field('lastName', JSON.stringify(profile1.lastName))
          .field('bio', JSON.stringify(profile1.bio))
          .expect(409)
          .expect((res) =>
            expect(res.body.message).toEqual('Le profil a déjà été créé'),
          );
      });
      it('should return 201, and the created profile including file', async () => {
        const response = await login(user2);
        const token = response.body.user.token;
        await request(app.getHttpServer())
          .post('/profile')
          .set('Authorization', `Bearer ${token}`)
          .field('firstName', JSON.stringify(profile1.firstName))
          .field('lastName', JSON.stringify(profile1.lastName))
          .field('bio', JSON.stringify(profile1.bio))
          .attach('file', `${__dirname}/validTestFile.jpeg`)
          .expect(201);
      });

      it('should fail if format file not allowed', async () => {
        const response = await login(admin);
        const token = response.body.user.token;
        await request(app.getHttpServer())
          .post('/profile')
          .set('Authorization', `Bearer ${token}`)
          .field('firstName', JSON.stringify(profile1.firstName))
          .field('lastName', JSON.stringify(profile1.lastName))
          .field('bio', JSON.stringify(profile1.bio))
          .attach('file', `${__dirname}/invalidTestFile.svg`)
          .expect(400);
      });
    });

    describe('FIND ALL', () => {
      it('should 200 and profiles array', async () => {
        const loged = await login(user1);
        const token = loged.body.user.token;
        return request(app.getHttpServer())
          .get('/profile')
          .set('Authorization', `Bearer ${token}`)
          .expect(200)
          .expect((res) =>
            expect(res.body).toEqual([
              {
                bio: 'bio bio bio bio bio bio bio',
                id: expect.any(String),
                photo: '',
                user: {
                  id: expect.any(String),
                  username: 'username',
                },
              },
              {
                bio: '"bio bio bio bio bio bio bio"',
                id: expect.any(String),
                photo: expect.any(String),
                user: {
                  id: expect.any(String),
                  username: 'username2',
                },
              },
            ]),
          );
      });

      it('should throw 401', async () => {
        return request(app.getHttpServer()).get('/profile').expect(401);
      });
    });

    describe('FIND ONE', () => {
      let token;
      let profile;
      // Be carefull, use the user id to retrive the profile, not de profile id
      it('return ', async () => {
        const loged = await login(admin);
        token = loged.body.user.token;
        profile = await request(app.getHttpServer())
          .post('/profile')
          .set('Authorization', `Bearer ${token}`)
          .send(profile1);

        await request(app.getHttpServer())
          .get(`/profile/${profile.body.profile.userId}`)
          .set('Authorization', `Bearer ${token}`)
          .expect(200)
          .expect((res) =>
            expect(res.body).toEqual({
              bio: 'bio bio bio bio bio bio bio',
              createdAt: expect.any(String),
              firstName: 'firstName',
              id: expect.any(String),
              lastName: 'lastname',
              photo: '',
              user: {
                id: expect.any(String),
                posts: [],
                username: 'admin',
              },
            }),
          );
      });
      it('should throw 404', async () => {
        return request(app.getHttpServer())
          .get('/profile/blablaid')
          .set('Authorization', `Bearer ${token}`)
          .expect(404)
          .expect((res) => {
            expect(res.body.message).toEqual('Profil introuvable !');
          });
      });
    });

    describe('UPDATE', () => {
      let profilesList;
      const updateProfileDto: UpdateProfileDto = {
        firstName: 'ufirstName',
        lastName: 'ulastname',
        bio: 'ubio bio bio bio bio bio bio',
      };

      it('should uptdate profile', async () => {
        const loged = await login(user1);
        const token = loged.body.user.token;
        profilesList = await request(app.getHttpServer())
          .get('/profile')
          .set('Authorization', `Bearer ${token}`);

        const profileId = profilesList.body[0].id;
        await request(app.getHttpServer())
          .patch(`/profile/${profileId}`)
          .set('Authorization', `Bearer ${token}`)
          .send(updateProfileDto)
          .expect(200);
      });

      it('should return 403', async () => {
        const loged = await login(user2);
        const token = loged.body.user.token;
        const profileId = profilesList.body[0].id;

        await request(app.getHttpServer())
          .patch(`/profile/${profileId}`)
          .set('Authorization', `Bearer ${token}`)
          .send(updateProfileDto)
          .expect(403);
      });

      it('should update when uploaded file', async () => {
        const loged = await login(user1);
        const token = loged.body.user.token;
        const profileId = profilesList.body[0].id;

        await request(app.getHttpServer())
          .patch(`/profile/${profileId}`)
          .set('Authorization', `Bearer ${token}`)
          .field('firstName', JSON.stringify(updateProfileDto.firstName))
          .field('lastName', JSON.stringify(updateProfileDto.lastName))
          .field('bio', JSON.stringify(updateProfileDto.bio))
          .attach('file', `${__dirname}/validTestFile.jpeg`)
          .expect(200)
          .expect((res) =>
            expect(res.body.message).toEqual('Profil modifié !'),
          );
      });

      it('should throw message if update fail', async () => {
        const loged = await login(user1);
        const token = loged.body.user.token;

        await request(app.getHttpServer())
          .patch(`/profile/blablaid`)
          .set('Authorization', `Bearer ${token}`)
          .field('firstName', JSON.stringify(updateProfileDto.firstName))
          .field('lastName', JSON.stringify(updateProfileDto.lastName))
          .field('bio', JSON.stringify(updateProfileDto.bio))
          .attach('file', `${__dirname}/validTestFile.jpeg`)
          .expect(404)
          .expect((res) =>
            expect(res.body.message).toEqual('Ressource introuvable'),
          );
      });
    });
  });
});
