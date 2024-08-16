import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseAbstractRepository } from './base/base.abstract.repository';
import { PaymentEntity } from '../entities/Payment.entity';
import { PaymentRepositoryInterface } from '../interfaces/payment.repository.interface';

@Injectable()
export class PaymentsRepository
  extends BaseAbstractRepository<PaymentEntity>
  implements PaymentRepositoryInterface
{
  constructor(
    @InjectRepository(PaymentEntity)
    private readonly PaymentRepository: Repository<PaymentEntity>,
  ) {
    super(PaymentRepository);
  }
}
