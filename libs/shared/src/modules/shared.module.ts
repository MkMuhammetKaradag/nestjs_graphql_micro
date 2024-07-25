import { DynamicModule, Inject, Module } from '@nestjs/common';
import { SharedService } from '../service/shared.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientProxyFactory, Transport } from '@nestjs/microservices';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
  ],
  providers: [SharedService],
  exports: [SharedService],
})
export class SharedModule {
  static registerRmq(service: string, queue: string): DynamicModule {
    const provider = {
      provide: service,
      useFactory: (configService: ConfigService) => {
        const USER = configService.get<string>('RABBITMQ_USER');
        const PASS = configService.get<string>('RABBITMQ_PASS');
        const HOST = configService.get<string>('RABBITMQ_HOST');
        const URI = configService.get<string>('RABBITMQ_URI');
        return ClientProxyFactory.create({
          transport: Transport.RMQ,
          options: {
            urls: [`amqp://${USER}:${PASS}@${HOST}`],
            // urls: [URI],
            queue: queue,
            queueOptions: {
              durable: true,
            },
          },
        });
      },
      inject: [ConfigService],
    };
    return {
      module: SharedModule,
      providers: [provider],
      exports: [provider],
    };
  }
}
