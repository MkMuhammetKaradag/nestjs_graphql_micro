import { NestFactory } from '@nestjs/core';
import { ChatModule } from './chat.module';
import { SharedService } from '@app/shared';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(ChatModule);
  const configService = app.get(ConfigService);
  const sharedService = app.get(SharedService);
  const port = configService.get('CHAT_PORT');
  const queue = configService.get<string>('RABBITMQ_CHAT_QUEUE');

  app.connectMicroservice(sharedService.getRmqOptions(queue));
  app.startAllMicroservices();
  await app.listen(port);
}
bootstrap();
