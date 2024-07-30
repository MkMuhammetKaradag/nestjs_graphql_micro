import { Injectable } from '@nestjs/common';

@Injectable()
export class ProductService {
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
}
