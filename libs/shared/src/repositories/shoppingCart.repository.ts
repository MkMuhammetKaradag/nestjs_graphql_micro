import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseAbstractRepository } from './base/base.abstract.repository';
import { ShoppingCartRepositoryInterface } from '../interfaces/shoppingCart.repository.interface';
import { ShoppingCartEntity } from '../entities/shoppingCart.entity';

@Injectable()
export class ShoppingCartsRepository
  extends BaseAbstractRepository<ShoppingCartEntity>
  implements ShoppingCartRepositoryInterface
{
  constructor(
    @InjectRepository(ShoppingCartEntity)
    private readonly ShoppingCartRepository: Repository<ShoppingCartEntity>,
  ) {
    super(ShoppingCartRepository);
  }
}
