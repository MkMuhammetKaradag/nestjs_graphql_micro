import { ShoppingCartItemEntity } from '../entities/shoppingCartItem.Entity ';

import { BaseInterfaceRepository } from '../repositories/base/base.interface.repository';

export interface ShoppingCartItemRepositoryInterface
  extends BaseInterfaceRepository<ShoppingCartItemEntity> {}
