import { NestFactory } from '@nestjs/core';
import { PaymentModule } from './payment.module';
import { SharedService } from '@app/shared';
import { ConfigService } from '@nestjs/config';
async function bootstrap() {
  const app = await NestFactory.create(PaymentModule);

  const configService = app.get(ConfigService);
  const sharedService = app.get(SharedService);
  const port = configService.get('PAYMENT_PORT');
  const queue = configService.get<string>('RABBITMQ_PAYMENT_QUEUE');

  app.connectMicroservice(sharedService.getRmqOptions(queue));
  app.startAllMicroservices();
  await app.listen(port);
}
bootstrap();
