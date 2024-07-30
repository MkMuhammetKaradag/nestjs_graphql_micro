import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import * as cookieParser from 'cookie-parser';
import * as graphqlUploadExpress from 'graphql-upload/graphqlUploadExpress.js';
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const PORT = configService.get<number>('API_PORT');

  app.use(graphqlUploadExpress({ maxFileSize: 10000000, maxFiles: 3 }));
  app.use(cookieParser());
  await app.listen(PORT);
}
bootstrap();
