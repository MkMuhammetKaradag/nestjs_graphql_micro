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
import { last, map } from 'rxjs';
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
      relations: ['chats', 'chats.users'], // 'chats' relations field will fetch all chats the user is part of
    });
  }

  async getChat(getChatDto: { chatId: number; userId: number }) {
    const { chatId, userId } = getChatDto;
    const chat = await this.chatRepository.findByCondition({
      where: { id: chatId },
      select: {
        id: true,
        users: {
          id: true,
          firstName: true,
          lastName: true,
          profilPhoto: true,
          isOnline: true,
        },
      },
      relations: ['users'],
    });
    // const chat = await this.chatRepository
    //   .createQueryBuilder('chat')
    //   .leftJoinAndSelect('chat.users', 'user')
    //   .where('chat.id = :chatId', { chatId })
    //   .andWhere('user.id = :userId', { userId })
    //   .getOne();

    if (!chat) {
      throw new RpcException({
        message: 'Chat not found',
        statusCode: HttpStatus.NOT_FOUND,
      });
    }
    const userExists = chat.users.some((user) => user.id === userId);
    if (!userExists) {
      throw new RpcException({
        message: 'USER UNAUTHORIZED',
        statusCode: HttpStatus.UNAUTHORIZED,
      });
    }

    return chat;
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
        // users: {
        //   id: senderId,
        // },
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

    const sender = await this.userRepository.findByCondition({
      where: {
        id: senderId,
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        isOnline: true,
        profilPhoto: true,
      },
    });
    if (!sender) {
      throw new RpcException({
        message: 'User not found',
        statusCode: HttpStatus.NOT_FOUND,
      });
    }
    console.log(chat);
    const usersId = chat.users.map((user) => user.id);
    const message = this.messageRepository.create({
      content,
      sender: sender,
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

  async getMessages(getMessagesDto: {
    chatId: number;
    skip: number;
    take: number;
    userId: number;
  }) {
    const { chatId, skip, take, userId } = getMessagesDto;
    const chat = await this.chatRepository.findByCondition({
      where: {
        id: chatId,
        users: {
          id: userId,
        },
      },
    });

    if (!chat) {
      throw new RpcException({
        message: 'Chat not found',
        statusCode: HttpStatus.NOT_FOUND,
      });
    }

    const [messages, total] = await this.messageRepository.pagination({
      where: { chat: { id: chatId } },
      select: {
        id: true,
        content: true,
        createdAt: true,
        sender: {
          id: true,
          firstName: true,
          lastName: true,
          profilPhoto: true,
        },
      },
      relations: ['sender'],
      order: { createdAt: 'DESC' }, // Son mesajlar önce gelsin
      skip: skip,
      take: take,
    });

    return { messages, total };
  }
}
