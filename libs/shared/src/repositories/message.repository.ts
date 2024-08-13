import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseAbstractRepository } from './base/base.abstract.repository';
import { MessageEntity } from '../entities/message.entity';
import { MessageRepositoryInterface } from '../interfaces/message.repository.interface';

@Injectable()
export class MessagesRepository
  extends BaseAbstractRepository<MessageEntity>
  implements MessageRepositoryInterface
{
  constructor(
    @InjectRepository(MessageEntity)
    private readonly messageRepository: Repository<MessageEntity>,
  ) {
    super(messageRepository);
  }
}
