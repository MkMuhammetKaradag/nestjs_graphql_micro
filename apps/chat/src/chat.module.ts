import { Module } from '@nestjs/common';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { ConfigModule } from '@nestjs/config';
import {
  ChatEntity,
  ChatsRepository,
  CommentEntity,
  LikeEntity,
  LivekitModule,
  MessageEntity,
  MessageReadEntity,
  MessageReadsRepository,
  MessagesRepository,
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

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    SharedModule,
    PostgresDBModule,
    LivekitModule,
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
  controllers: [ChatController],
  providers: [
    {
      provide: 'ChatServiceInterface',
      useClass: ChatService,
    },
    {
      provide: 'UsersRepositoryInterface',
      useClass: UsersRepository,
    },
    {
      provide: 'SharedServiceInterface',
      useClass: SharedService,
    },
    {
      provide: 'ChatsRepositoryInterface',
      useClass: ChatsRepository,
    },
    {
      provide: 'MessagesRepositoryInterface',
      useClass: MessagesRepository,
    },

    {
      provide: 'MessageReadsRepositoryInterface',
      useClass: MessageReadsRepository,
    },
  ],
})
export class ChatModule {}
