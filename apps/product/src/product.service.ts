import { ProductRepositoryInterface } from '@app/shared/interfaces/product-repository.interface';
import { Inject, Injectable } from '@nestjs/common';
import { CreateProductDTO } from './dtos/create-product.dto';
import { UserRepositoryInterface } from '@app/shared';
import { Like } from 'typeorm';

@Injectable()
export class ProductService {
  constructor(
    @Inject('ProductsRepositoryInterface')
    private readonly productRepository: ProductRepositoryInterface,
    @Inject('UsersRepositoryInterface')
    private readonly userRepository: UserRepositoryInterface,
  ) {}

  getHello(): string {
    return 'Hello World!';
  }
  async getProduct(paginationOptions: {
    take: number;
    skip: number;
    keyword: string;
  }) {
    const take = paginationOptions.take || 10;
    const skip = paginationOptions.skip || 10;
    const keyword = paginationOptions.keyword || '';
    const [products, total] = await this.productRepository.pagination({
      where: { name: Like('%' + keyword + '%') },
      order: { name: 'DESC' },
      take: take,
      skip: skip,
    });

    return { products, total };
  }

  async createProduct(createProductDto: CreateProductDTO) {
    const { description, name, price, quantity, userId } = createProductDto;
    const vendor = await this.userRepository.findOneById(userId);
    const product = await this.productRepository.save({
      description,
      name,
      price,
      quantity,
      vendor,
    });
    return { product };
  }
}
