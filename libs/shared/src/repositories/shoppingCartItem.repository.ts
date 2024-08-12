import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseAbstractRepository } from './base/base.abstract.repository';

import { ShoppingCartItemEntity } from '../entities/shoppingCartItem.Entity ';
import { ShoppingCartItemRepositoryInterface } from '../interfaces/shoppingCartItems.repository.interface';

@Injectable()
export class ShoppingCartItemsRepository
  extends BaseAbstractRepository<ShoppingCartItemEntity>
  implements ShoppingCartItemRepositoryInterface
{
  constructor(
    @InjectRepository(ShoppingCartItemEntity)
    private readonly ShoppingCartItemRepository: Repository<ShoppingCartItemEntity>,
  ) {
    super(ShoppingCartItemRepository);
  }
}
