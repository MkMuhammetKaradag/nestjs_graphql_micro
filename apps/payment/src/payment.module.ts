import { Module } from '@nestjs/common';
import { PaymentController } from './payment.controller';
import { PaymentService } from './payment.service';
import { ConfigModule } from '@nestjs/config';
import {
  ChatEntity,
  CommentEntity,
  LikeEntity,
  MessageEntity,
  MessageReadEntity,
  PaymentEntity,
  PostgresDBModule,
  ProductEntity,
  SharedModule,
  SharedService,
  ShoppingCartEntity,
  ShoppingCartItemEntity,
  UserEntity,
} from '@app/shared';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    SharedModule,
    PostgresDBModule,
    TypeOrmModule.forFeature([
      UserEntity,
      ProductEntity,
      CommentEntity,
      LikeEntity,
      ShoppingCartEntity,
      ShoppingCartItemEntity,
      ChatEntity,
      MessageEntity,
      MessageReadEntity,
      PaymentEntity,
    ]),
  ],
  controllers: [PaymentController],
  providers: [
    PaymentService,
    {
      provide: 'SharedServiceInterface',
      useClass: SharedService,
    },
  ],
})
export class PaymentModule {}
