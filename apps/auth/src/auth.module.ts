import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import {
  ChatEntity,
  CloudinaryModule,
  CommentEntity,
  EmailModule,
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
  UsersRepository,
} from '@app/shared';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './jwt-strategy';
import { JwtGuard } from './jwt.guard';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET'),
        signOptions: { expiresIn: '3600s' },
      }),
      inject: [ConfigService],
    }),
    SharedModule,
    PostgresDBModule,
    EmailModule,
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
  controllers: [AuthController],
  providers: [
    JwtGuard,
    JwtStrategy,
    {
      provide: 'AuthServiceInterface',
      useClass: AuthService,
    },
    {
      provide: 'SharedServiceInterface',
      useClass: SharedService,
    },
    {
      provide: 'UsersRepositoryInterface',
      useClass: UsersRepository,
    },
  ],
})
export class AuthModule {}
