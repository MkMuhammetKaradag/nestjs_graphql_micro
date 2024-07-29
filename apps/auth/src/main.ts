import { NestFactory } from '@nestjs/core';
import { AuthModule } from './auth.module';
import { ConfigService } from '@nestjs/config';
import { SharedService } from '@app/shared';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AuthModule);

  app.useStaticAssets(join(__dirname, '..', 'public'));

  app.setBaseViewsDir(join(__dirname, '..', 'api/email-templates'));
  app.setViewEngine('ejs');

  const configService = app.get(ConfigService);
  const sharedService = app.get(SharedService);
  const port = configService.get('AUTH_PORT');
  const queue = configService.get<string>('RABBITMQ_AUTH_QUEUE');

  app.connectMicroservice(sharedService.getRmqOptions(queue));
  app.startAllMicroservices();
  await app.listen(port);
}
bootstrap();
