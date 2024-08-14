import {
  ChatRepositoryInterface,
  ChatsRepository,
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
  ) {}
  getHello(): string {
    return 'Hello World!';
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
}
