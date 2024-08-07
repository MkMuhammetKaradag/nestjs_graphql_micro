import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseAbstractRepository } from './base/base.abstract.repository';
import { CommentEntity } from '../entities/comment.entity';
import { CommentRepositoryInterface } from '../interfaces/comment.repository.interface';

@Injectable()
export class CommentsRepository
  extends BaseAbstractRepository<CommentEntity>
  implements CommentRepositoryInterface
{
  constructor(
    @InjectRepository(CommentEntity)
    private readonly CommentRepository: Repository<CommentEntity>,
  ) {
    super(CommentRepository);
  }
}
