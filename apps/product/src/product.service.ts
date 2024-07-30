import { ProductRepositoryInterface } from '@app/shared/interfaces/product-repository.interface';
import { Inject, Injectable } from '@nestjs/common';
import { CreateProductDTO } from './dtos/create-product.dto';
import { UserRepositoryInterface } from '@app/shared';

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
  getProduct() {
    const products = [
      {
        id: 1,
        name: 'Product 1',
        price: 10.99,
      },
      {
        id: 2,
        name: 'Product 2',
        price: 10.2,
      },
    ];
    return { products };
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
