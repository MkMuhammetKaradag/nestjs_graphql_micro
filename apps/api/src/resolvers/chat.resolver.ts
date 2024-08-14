import {
  AuthGuard,
  ChatEntity,
  MessageEntity,
  PUB_SUB,
  Roles,
  RolesGuard,
} from '@app/shared';
import { BadRequestException, Inject, UseGuards } from '@nestjs/common';
import {
  Args,
  Context,
  Mutation,
  Query,
  Resolver,
  Subscription,
} from '@nestjs/graphql';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

import { GraphQLError } from 'graphql';
import { SendMessageInput } from '../InputTypes/chat.Input';
import { RedisPubSub } from 'graphql-redis-subscriptions';
const MESSAGE_SENT = 'messageSent';
Resolver('shoppingCart');
export class ChatResolver {
  constructor(
    @Inject('CHAT_SERVICE')
    private readonly chatService: ClientProxy,

    @Inject(PUB_SUB) private pubSub: RedisPubSub,
  ) {}

  @Mutation(() => ChatEntity)
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('user')
  async createChat(
    @Args('userIds', { type: () => [Number] }) userIds: number[],
    @Context() context,
  ): Promise<ChatEntity> {
    const { req, res } = context;
    if (!req?.user) {
      throw new BadRequestException();
    }

    try {
      const data = await firstValueFrom<ChatEntity>(
        this.chatService.send(
          {
            cmd: 'create-chat',
          },
          {
            userIds: [...userIds, req.user.id],
          },
        ),
      );

      return data;
    } catch (error) {
      throw new GraphQLError(error.message, {
        extensions: { ...error },
      });
    }
  }

  @Mutation(() => MessageEntity)
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('user')
  async sendMessage(
    @Args('sendMessageInput') sendMessageInput: SendMessageInput,
    @Context() context,
  ): Promise<MessageEntity> {
    const { req, res } = context;
    if (!req?.user) {
      throw new BadRequestException();
    }
    try {
      const data = await firstValueFrom<{
        message: MessageEntity;
        users: number[];
      }>(
        this.chatService.send(
          {
            cmd: 'send-message',
          },
          {
            chatId: sendMessageInput.chatId,
            senderId: req.user.id,
            content: sendMessageInput.content,
          },
        ),
      );
      if (data.message) {
        this.pubSub.publish(MESSAGE_SENT, {
          messageSent: {
            ...data.message,
            users: data.users,
          },
        });
      }
      return data.message;
    } catch (error) {
      throw new GraphQLError(error.message, {
        extensions: { ...error },
      });
    }
  }
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('user')
  @Subscription(() => MessageEntity, {
    filter: async function (payload, variables, context) {
      const { req, res } = context;
      if (!req?.user) {
        throw new BadRequestException();
      }
      const user = req.user; // Kullanıcıyı context üzerinden alın
      const chatId = variables.chatId;

      // Kullanıcının bu sohbetin bir parçası olup olmadığını kontrol edin
      const isUserInChat = await this.isUserInChat(
        payload.messageSent.users,
        user.id,
      );
      // console.log(payload.messageSent);
      // Mesajın doğru sohbette olup olmadığını ve kullanıcının bu sohbetin bir parçası olup olmadığını kontrol edin
      return payload.messageSent.chat.id === chatId && isUserInChat;
    },
  })
  messageSent(@Args('chatId') chatId: number, @Context() context) {
    return this.pubSub.asyncIterator(MESSAGE_SENT);
  }

  async isUserInChat(users: number[], userId: number): Promise<boolean> {
    // Kullanıcının bu sohbette olup olmadığını kontrol eden bir yardımcı fonksiyon
    // Örnek bir sorgu:
    // const chat = await this.chatRepository.findOne(chatId, { relations: ['users'] });
    // return chat.users.some(user => user.id === userId);

    // Örnek return değeri
    console.log(users);
    console.log(userId);
    console.log(userId in users);
    return userId in users; // Kullanıcının bu sohbette olduğunu varsayıyoruz
  }
}
