import {
  ChatRepositoryInterface,
  ChatsRepository,
  MessageReadRepositoryInterface,
  MessageReadsRepository,
  MessageRepositoryInterface,
  UserRepositoryInterface,
} from '@app/shared';
import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { userInfo } from 'os';
import { map } from 'rxjs';
import { In } from 'typeorm';

@Injectable()
export class ChatService {
  constructor(
    @Inject('UsersRepositoryInterface')
    private readonly userRepository: UserRepositoryInterface,

    @Inject('ChatsRepositoryInterface')
    private readonly chatRepository: ChatsRepository,

    @Inject('MessagesRepositoryInterface')
    private readonly messageRepository: MessageRepositoryInterface,

    @Inject('MessageReadsRepositoryInterface')
    private readonly messageReadRepository: MessageReadsRepository,
  ) {}
  getHello(): string {
    return 'Hello World!';
  }

  async getUserChats(userId: number) {
    return await this.userRepository.findByCondition({
      where: { id: userId },
      relations: ['chats',"chats.users"], // 'chats' relations field will fetch all chats the user is part of
    });
  }

  async createChat(createChatProp: { userIds: number[] }) {
    console.log(createChatProp);
    const users = await this.userRepository.findWithRelations({
      where: {
        id: In(createChatProp.userIds),
      },
    });

    if (users.length !== createChatProp.userIds.length) {
      throw new Error('Some users not found');
    }

    const chat = this.chatRepository.create({ users });
    await this.chatRepository.save(chat);

    return chat;
  }

  async sendMessage(sendMessageDto: {
    chatId: number;
    senderId: number;
    content: string;
  }) {
    const { chatId, content, senderId } = sendMessageDto;

    const chat = await this.chatRepository.findByCondition({
      where: {
        id: chatId,
        users: {
          id: senderId,
        },
      },
      select: {
        id: true,
        users: { id: true }, // Sadece userId alanının id ve name alanlarını çek
      },
      relations: ['users'],
    });
    if (!chat) {
      throw new RpcException({
        message: 'Chat not found',
        statusCode: HttpStatus.NOT_FOUND,
      });
    }
    const usersId = chat.users.map((user) => user.id);
    const message = this.messageRepository.create({
      content,
      sender: { id: senderId },
      chat: { id: chat.id },
    });
    await this.messageRepository.save(message);

    return { message, users: usersId };
  }

  async markMessageAsRead(markMessageDto: {
    messageId: number;
    userId: number;
  }) {
    const { messageId, userId } = markMessageDto;
    const message = await this.messageRepository.findOneById(messageId);
    if (!message) {
      throw new RpcException({
        message: 'Message not found',
        statusCode: HttpStatus.NOT_FOUND,
      });
    }
    const user = await this.userRepository.findOneById(userId);
    if (!user) {
      throw new RpcException({
        message: 'User not found',
        statusCode: HttpStatus.NOT_FOUND,
      });
    }

    const existingReadRecord = await this.messageReadRepository.findByCondition(
      {
        where: {
          user: { id: userId },
          message: { id: messageId },
        },
      },
    );

    if (existingReadRecord) {
      // The user has already marked this message as read
      throw new RpcException({
        message: ' The user has already marked this message as read',
        statusCode: HttpStatus.BAD_REQUEST,
      });
    }

    const messageRead = this.messageReadRepository.create({
      message,
      user: { id: userId },
    });
    await this.messageReadRepository.save(messageRead);

    return messageRead;
  }
}
