import {
  AuthGuard,
  ChatEntity,
  MessageEntity,
  Roles,
  RolesGuard,
} from '@app/shared';
import { BadRequestException, Inject, UseGuards } from '@nestjs/common';
import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

import { GraphQLError } from 'graphql';

Resolver('shoppingCart');
export class ChatResolver {
  constructor(
    @Inject('CHAT_SERVICE')
    private readonly chatService: ClientProxy,
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
}
