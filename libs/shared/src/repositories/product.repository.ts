import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseAbstractRepository } from './base/base.abstract.repository';
import { ProductRepositoryInterface } from '../interfaces/product-repository.interface';
import { ProductEntity } from '../entities/product.entity';

@Injectable()
export class ProductsRepository
  extends BaseAbstractRepository<ProductEntity>
  implements ProductRepositoryInterface
{
  constructor(
    @InjectRepository(ProductEntity)
    private readonly ProductRepository: Repository<ProductEntity>,
  ) {
    super(ProductRepository);
  }
}
