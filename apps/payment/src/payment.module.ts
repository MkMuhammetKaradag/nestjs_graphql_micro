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
  PaymentsRepository,
  PostgresDBModule,
  ProductEntity,
  ProductsRepository,
  SharedModule,
  SharedService,
  ShoppingCartEntity,
  ShoppingCartItemEntity,
  ShoppingCartsRepository,
  StripeModule,
  StripeService,
  UserEntity,
  UsersRepository,
} from '@app/shared';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    SharedModule,
    PostgresDBModule,
    StripeModule,
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
    StripeService,
    PaymentService,
    {
      provide: 'SharedServiceInterface',
      useClass: SharedService,
    },
    {
      provide: 'ProductsRepositoryInterface',
      useClass: ProductsRepository,
    },
    {
      provide: 'UsersRepositoryInterface',
      useClass: UsersRepository,
    },
    {
      provide: 'ShoppingCartsRepositoryInterface',
      useClass: ShoppingCartsRepository,
    },
    {
      provide: 'PaymentsRepositoryInterface',
      useClass: PaymentsRepository,
    },
  ],
})
export class PaymentModule {}
