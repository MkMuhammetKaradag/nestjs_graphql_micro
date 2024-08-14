import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { BaseAbstractRepository } from './base/base.abstract.repository';
import { ChatEntity } from '../entities/chat.entity';
import { ChatRepositoryInterface } from '../interfaces/chat.repository.interface';

@Injectable()
export class ChatsRepository
  extends BaseAbstractRepository<ChatEntity>
  implements ChatRepositoryInterface
{
  constructor(
    @InjectRepository(ChatEntity)
    private readonly chatRepository: Repository<ChatEntity>,
  ) {
    super(chatRepository);
  }

  // Kullanıcı ID'leri ve chat ID'sini döndüren metot
  // public async getUserIdsAndChatId(
  //   chatId: number,
  // ): Promise<{ chatId: number; userIds: number[] }> {
  //   const result = await this.chatRepository
  //     .createQueryBuilder('chat')
  //     .leftJoin('chat.users', 'user')
  //     .select(['chat.id AS chatId', 'user.id AS userId'])
  //     .where('chat.id = :chatId', { chatId })
  //     .getRawMany();

  //   // Chat ID ve kullanıcı ID'lerini uygun formatta döndürme
  //   const userIds = result.map((row) => row.userId);
  //   const chatIdResult = result.length > 0 ? result[0].chatId : null;

  //   return { chatId: chatIdResult, userIds };
  // }
}
