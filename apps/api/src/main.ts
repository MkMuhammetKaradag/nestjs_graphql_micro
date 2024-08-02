import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import * as cookieParser from 'cookie-parser';
import * as graphqlUploadExpress from 'graphql-upload/graphqlUploadExpress.js';
import { AllRpcExceptionsFilter } from '@app/shared';
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const PORT = configService.get<number>('API_PORT');

  app.enableCors({
    origin: ['http://localhost:5173'],
    allowedHeaders: [
      'Content-Type',
      'apollo-require-preflight',
      'Accept',
      'Authorization',
      'X-Requested-With',
    ],
    credentials: true,
  });
  app.use(graphqlUploadExpress({ maxFileSize: 10000000, maxFiles: 3 }));
  app.use(cookieParser());
  app.useGlobalFilters(new AllRpcExceptionsFilter());
  await app.listen(PORT);
}
bootstrap();
