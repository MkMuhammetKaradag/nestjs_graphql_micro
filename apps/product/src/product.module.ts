import { Module } from '@nestjs/common';
import { ProductController } from './product.controller';
import { ProductService } from './product.service';
import { ConfigModule } from '@nestjs/config';
import {
  CloudinaryModule,
  CloudinaryService,
  CommentEntity,
  CommentsRepository,
  LikeEntity,
  PostgresDBModule,
  ProductEntity,
  ProductsRepository,
  SharedModule,
  SharedService,
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
  ],
})
export class ProductModule {}
