import { ChatRepositoryInterface, UserRepositoryInterface } from '@app/shared';
import { Inject, Injectable } from '@nestjs/common';
import { userInfo } from 'os';
import { In } from 'typeorm';

@Injectable()
export class ChatService {
  constructor(
    @Inject('UsersRepositoryInterface')
    private readonly userRepository: UserRepositoryInterface,

    @Inject('ChatsRepositoryInterface')
    private readonly chatRepository: ChatRepositoryInterface,
  ) {}
  getHello(): string {
    return 'Hello World!';
  }

  async createChat(createChatProp: { userIds: number[] }) {
    console.log(createChatProp)
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
}
