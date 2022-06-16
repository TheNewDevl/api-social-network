import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { CreateUserDto } from 'src/user/dto/create-user.dto';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    console.log('ENVIRONEMENT: ', process.env.NODE_ENV);
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
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
    });
  });
});
