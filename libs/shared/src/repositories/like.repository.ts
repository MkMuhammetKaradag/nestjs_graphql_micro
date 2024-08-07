import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseAbstractRepository } from './base/base.abstract.repository';
import { LikeRepositoryInterface } from '../interfaces/like.repository.interface';
import { LikeEntity } from '../entities/like.entity';

@Injectable()
export class LikesRepository
  extends BaseAbstractRepository<LikeEntity>
  implements LikeRepositoryInterface
{
  constructor(
    @InjectRepository(LikeEntity)
    private readonly LikeRepository: Repository<LikeEntity>,
  ) {
    super(LikeRepository);
  }
}
