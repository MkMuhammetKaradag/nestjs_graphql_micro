import { MessageReadEntity } from '../entities/messageRead.entity';

import { BaseInterfaceRepository } from '../repositories/base/base.interface.repository';

export interface MessageReadRepositoryInterface
  extends BaseInterfaceRepository<MessageReadEntity> {}
