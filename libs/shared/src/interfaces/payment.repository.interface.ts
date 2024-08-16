import { PaymentEntity } from '../entities/payment.entity';

import { BaseInterfaceRepository } from '../repositories/base/base.interface.repository';

export interface PaymentRepositoryInterface
  extends BaseInterfaceRepository<PaymentEntity> {}
