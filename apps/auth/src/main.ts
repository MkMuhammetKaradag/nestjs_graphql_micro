import { NestFactory } from '@nestjs/core';
import { AuthModule } from './auth.module';
import { ConfigService } from '@nestjs/config';
import { SharedService } from '@app/shared';

async function bootstrap() {
  const app = await NestFactory.create(AuthModule);
  const configService = app.get(ConfigService);
  const sharedService = app.get(SharedService);
  const port = configService.get('AUTH_PORT');
  const queue = configService.get<string>('RABBITMQ_AUTH_QUEUE');

  app.connectMicroservice(sharedService.getRmqOptions(queue));
  app.startAllMicroservices();
  await app.listen(port);
}
bootstrap();
