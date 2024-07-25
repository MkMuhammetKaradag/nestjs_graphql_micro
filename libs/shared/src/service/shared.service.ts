import { Injectable } from '@nestjs/common';
import { SharedServiceInterface } from '../interfaces/shared.service.interface';
import { ConfigService } from '@nestjs/config';
import { RmqContext, RmqOptions, Transport } from '@nestjs/microservices';

@Injectable()
export class SharedService implements SharedServiceInterface {
  constructor(private readonly configService: ConfigService) {}

  getRmqOptions(queue: string): RmqOptions {
    const USER = this.configService.get<string>('RABBITMQ_USER');
    const PASS = this.configService.get<string>('RABBITMQ_PASS');
    const HOST = this.configService.get<string>('RABBITMQ_HOST');
    const URI = this.configService.get<string>('RABBITMQ_URI');

    return {
      transport: Transport.RMQ,
      options: {
        urls: [`amqp://${USER}:${PASS}@${HOST}`],
        // urls: [URI],
        queue: queue,
        noAck: false,
        queueOptions: {
          durable: true,
        },
      },
    };
  }
  acknowledgeMessage(context: RmqContext): void {
    const channel = context.getChannelRef();
    const message = context.getMessage();
    channel.ack(message);
  }
}
