import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseAbstractRepository } from './base/base.abstract.repository';

import { MessageReadRepositoryInterface } from '../interfaces/messageRead.repository.interface';
import { MessageReadEntity } from '../entities/messageRead.entity';

@Injectable()
export class MessageReadsRepository
  extends BaseAbstractRepository<MessageReadEntity>
  implements MessageReadRepositoryInterface
{
  constructor(
    @InjectRepository(MessageReadEntity)
    private readonly MessageReadRepository: Repository<MessageReadEntity>,
  ) {
    super(MessageReadRepository);
  }
}
