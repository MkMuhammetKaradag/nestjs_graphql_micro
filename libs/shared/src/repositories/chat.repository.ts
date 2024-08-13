import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
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
}
