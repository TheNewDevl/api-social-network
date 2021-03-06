import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import helmet from 'helmet';
import { ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';
import { ConfigService } from '@nestjs/config';

//CORS options
const corsOptions = {
  origin: true,
  credentials: true,
};

const port = new ConfigService().get('APP_PORT');

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  //Set cors config
  app.enableCors(corsOptions);

  //cookie parser
  app.use(cookieParser());

  //preflix all end points
  app.setGlobalPrefix('api');

  //helmet mid
  app.use(helmet({ crossOriginResourcePolicy: false }));

  //set a global validation pipe for DTOs
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  await app.listen(port || 3000);
}
bootstrap();
