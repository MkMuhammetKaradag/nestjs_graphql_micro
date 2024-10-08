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

  @MessagePattern({ cmd: 'get-userChats' })
  async getUserChats(
    @Ctx() context: RmqContext,
    @Payload()
    getUserChats: {
      userId: number;
    },
  ) {
    this.sharedService.acknowledgeMessage(context);
    return this.chatService.getUserChats(getUserChats.userId);
  }

  @MessagePattern({ cmd: 'get-chat' })
  async getChat(
    @Ctx() context: RmqContext,
    @Payload()
    getChatDto: {
      chatId: number;
      userId: number;
    },
  ) {
    this.sharedService.acknowledgeMessage(context);
    return this.chatService.getChat(getChatDto);
  }

  @MessagePattern({ cmd: 'create-chat' })
  async createChat(
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

  @MessagePattern({ cmd: 'mark-message' })
  async markMessageAsRead(
    @Ctx() context: RmqContext,
    @Payload()
    markMessageDto: {
      messageId: number;
      userId: number;
    },
  ) {
    this.sharedService.acknowledgeMessage(context);
    return this.chatService.markMessageAsRead(markMessageDto);
  }

  @MessagePattern({ cmd: 'get-messages' })
  async getMessages(
    @Ctx() context: RmqContext,
    @Payload()
    getMessagesDto: {
      chatId: number;
      skip: number;
      take: number;
      userId: number;
    },
  ) {
    this.sharedService.acknowledgeMessage(context);
    return this.chatService.getMessages(getMessagesDto);
  }

  @MessagePattern({ cmd: 'join-videoRoom' })
  async joinVideoRoom(
    @Ctx() context: RmqContext,
    @Payload()
    joinVideoRoomDto: {
      chatId: number;
      userId: number;
    },
  ) {
    this.sharedService.acknowledgeMessage(context);
    return this.chatService.joinVideoRoom(joinVideoRoomDto);
  }
}
