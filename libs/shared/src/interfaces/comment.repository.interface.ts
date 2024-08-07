import { CommentEntity } from '../entities/comment.entity';

import { BaseInterfaceRepository } from '../repositories/base/base.interface.repository';

export interface CommentRepositoryInterface
  extends BaseInterfaceRepository<CommentEntity> {}
