import { Controller, Get, Inject } from '@nestjs/common';
import { ChatService } from './chat.service';
import { SharedService } from '@app/shared';
import {
  Ctx,
  MessagePattern,
  Payload,
  RmqContext,
} from '@nestjs/microservices';

@Controller()
export class ChatController {
  constructor(
    @Inject('ChatServiceInterface')
    private readonly chatService: ChatService,
    @Inject('SharedServiceInterface')
    private readonly sharedService: SharedService,
  ) {}

  @Get()
  getHello(): string {
    return this.chatService.getHello();
  }

  @MessagePattern({ cmd: 'create-chat' })
  async getChat(
    @Ctx() context: RmqContext,
    @Payload()
    createChats: {
      userIds: number[];
    },
  ) {
    this.sharedService.acknowledgeMessage(context);
    return this.chatService.createChat(createChats);
  }

  @MessagePattern({ cmd: 'send-message' })
  async sendMessage(
    @Ctx() context: RmqContext,
    @Payload()
    sendMessage: {
      chatId: number;
      senderId: number;
      content: string;
    },
  ) {
    this.sharedService.acknowledgeMessage(context);
    return this.chatService.sendMessage(sendMessage);
  }
}