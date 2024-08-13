import { ChatEntity } from '../entities/chat.entity';

import { BaseInterfaceRepository } from '../repositories/base/base.interface.repository';

export interface ChatRepositoryInterface
  extends BaseInterfaceRepository<ChatEntity> {}
