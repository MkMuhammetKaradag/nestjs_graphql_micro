import {
  AuthGuard,
  ChatEntity,
  MessageEntity,
  MessageReadEntity,
  PUB_SUB,
  Roles,
  RolesGuard,
  UserEntity,
} from '@app/shared';
import {
  BadRequestException,
  Inject,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
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
import {
  GetChatInput,
  GetMessagesInput,
  MarkMessageAsReadInput,
  SendMessageInput,
} from '../InputTypes/chat.Input';
import { RedisPubSub } from 'graphql-redis-subscriptions';
import { GetMessagesResponse } from '../InputTypes/chat.object';
const MESSAGE_SENT = 'messageSent';
const MESSAGE_READ = 'messageRead';
Resolver('shoppingCart');
export class ChatResolver {
  constructor(
    @Inject('CHAT_SERVICE')
    private readonly chatService: ClientProxy,

    @Inject(PUB_SUB) private pubSub: RedisPubSub,
  ) {}

  @Query(() => UserEntity)
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('user')
  async getUserChats(@Context() context): Promise<UserEntity> {
    const { req, res } = context;
    if (!req?.user) {
      throw new BadRequestException();
    }
    try {
      const user = await firstValueFrom<UserEntity>(
        this.chatService.send(
          {
            cmd: 'get-userChats',
          },
          {
            userId: req.user.id,
          },
        ),
      );
      return user;
    } catch (error) {
      throw new GraphQLError(error.message, {
        extensions: { ...error },
      });
    }
  }

  @Query(() => ChatEntity)
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('user')
  async getChat(
    @Args('getChatInput') getChatInput: GetChatInput,
    @Context() context,
  ): Promise<ChatEntity> {
    const { req, res } = context;
    if (!req?.user) {
      throw new BadRequestException();
    }
    try {
      const chat = await firstValueFrom<ChatEntity>(
        this.chatService.send(
          {
            cmd: 'get-chat',
          },
          {
            userId: req.user.id,
            chatId: getChatInput.chatId,
          },
        ),
      );
      return chat;
    } catch (error) {
      throw new GraphQLError(error.message, {
        extensions: { ...error },
      });
    }
  }

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
        // console.log(data.users);
        // console.log(req.user.id);
        // console.log(data.users.includes(4));
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
      // console.log(isUserInChat);
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
    return users.includes(userId); // Kullanıcının bu sohbette olduğunu varsayıyoruz
  }

  @Mutation(() => MessageReadEntity)
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('user')
  async markMessageAsRead(
    @Args('markMessageAsReadInput')
    markMessageAsReadInput: MarkMessageAsReadInput,
    @Context() context,
  ): Promise<MessageReadEntity> {
    const { req, res } = context;
    if (!req?.user.id) {
      throw new BadRequestException();
    }
    try {
      const data = await firstValueFrom<MessageReadEntity>(
        this.chatService.send(
          {
            cmd: 'mark-message',
          },
          {
            messageId: markMessageAsReadInput.messageId,
            userId: req.user.id,
          },
        ),
      );
      if (data) {
        this.pubSub.publish(MESSAGE_READ, {
          messageRead: {
            ...data,
          },
        });
      }
      return data;
    } catch (error) {
      throw new GraphQLError(error.message, {
        extensions: { ...error },
      });
    }
  }

  @Subscription(() => MessageReadEntity, {
    filter: (payload, variables) =>
      payload.messageRead.message.id === variables.messageId,
  })
  messageRead(@Args('messageId') messageId: number) {
    return this.pubSub.asyncIterator('messageRead');
  }

  @Query(() => GetMessagesResponse)
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('user')
  async getMessages(
    @Args('getMessageInput') getMessageInput: GetMessagesInput,
    @Context() context,
  ): Promise<GetMessagesResponse> {
    const { res, req } = context;
    if (!req?.user.id) {
      throw new UnauthorizedException();
    }
    try {
      const data = await firstValueFrom<GetMessagesResponse>(
        this.chatService.send(
          {
            cmd: 'get-messages',
          },
          {
            userId: req.user.id,
            ...getMessageInput,
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

  @Mutation(() => String)
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('user')
  async joinVideoRoom(
    @Args('chatId')
    chatId: number,
    @Context() context,
  ): Promise<string> {
    const { req, res } = context;
    if (!req?.user.id) {
      throw new BadRequestException();
    }
    try {
      const token = await firstValueFrom<string>(
        this.chatService.send(
          {
            cmd: 'join-videoRoom',
          },
          {
            chatId,
            userId: req.user.id,
          },
        ),
      );
      return token;
    } catch (error) {
      throw new GraphQLError(error.message, {
        extensions: { ...error },
      });
    }
  }
}
