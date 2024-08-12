import { ShoppingCartEntity } from '../entities/shoppingCart.entity';

import { BaseInterfaceRepository } from '../repositories/base/base.interface.repository';

export interface ShoppingCartRepositoryInterface
  extends BaseInterfaceRepository<ShoppingCartEntity> {}
