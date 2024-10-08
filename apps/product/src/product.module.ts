import { Module } from '@nestjs/common';
import { ProductController } from './product.controller';
import { ProductService } from './product.service';
import { ConfigModule } from '@nestjs/config';
import {
  ChatEntity,
  CloudinaryModule,
  CloudinaryService,
  CommentEntity,
  CommentsRepository,
  LikeEntity,
  MessageEntity,
  MessageReadEntity,
  PaymentEntity,
  PostgresDBModule,
  ProductEntity,
  ProductsRepository,
  SharedModule,
  SharedService,
  ShoppingCartEntity,
  ShoppingCartItemEntity,
  ShoppingCartsRepository,
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
    CloudinaryModule,
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
  controllers: [ProductController],
  providers: [
    {
      provide: 'producServiceInterface',
      useClass: ProductService,
    },
    {
      provide: 'SharedServiceInterface',
      useClass: SharedService,
    },
    {
      provide: 'CloudinaryServiceInterface',
      useClass: CloudinaryService,
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
      provide: 'CommentsRepositoryInterface',
      useClass: CommentsRepository,
    },
    {
      provide: 'ShoppingCartsRepositoryInterface',
      useClass: ShoppingCartsRepository,
    },
  ],
})
export class ProductModule {}
