import {
  CommentRepositoryInterface,
  PaymentRepositoryInterface,
  ShoppingCartEntity,
  ShoppingCartRepositoryInterface,
  UserRepositoryInterface,
} from '@app/shared';
import { ProductRepositoryInterface } from '@app/shared/interfaces/product-repository.interface';
import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';

@Injectable()
export class PaymentService {
  constructor(
    @Inject('ProductsRepositoryInterface')
    private readonly productRepository: ProductRepositoryInterface,

    @Inject('UsersRepositoryInterface')
    private readonly userRepository: UserRepositoryInterface,

    @Inject('ShoppingCartsRepositoryInterface')
    private readonly shoppingCartRepository: ShoppingCartRepositoryInterface,

    @Inject('PaymentsRepositoryInterface')
    private readonly paymentRepository: PaymentRepositoryInterface,
  ) {}

  getHello(): string {
    return 'Hello World!';
  }

  async createPayment(createdPaymentDto: {
    cartId: number;
    userId: number;
    amount: number;
  }) {
    const { cartId, userId, amount } = createdPaymentDto;

    const cart = await this.shoppingCartRepository.findByCondition({
      where: {
        id: cartId,
        user: {
          id: userId,
        },
      },
      relations: ['items', 'items.product', 'user'],
    });

    const userWithCart = await this.userRepository.findByCondition({
      where: { id: userId },
      relations: ['shoppingCart'],
    });

    // Check stock levels for each item in the cart
    if (!cart || !userWithCart) {
      throw new RpcException({
        message: 'Cart not found',
        statusCode: HttpStatus.NOT_FOUND,
      });
    }

    let cartAmount = 0;
    for (const item of cart.items) {
      const product = await this.productRepository.findByCondition({
        where: { id: item.product.id },
      });
      if (!product) {
        throw new RpcException({
          message: `Product with ID ${item.product.id} not found`,
          statusCode: HttpStatus.BAD_REQUEST,
        });
      }

      if (product.quantity < item.quantity) {
        throw new RpcException({
          message: `Insufficient stock for product ${product.name}`,
          statusCode: HttpStatus.BAD_REQUEST,
        });
      }

      cartAmount += item.quantity * product.price;
    }
    if (!(cartAmount === amount)) {
      throw new RpcException({
        message: `There is a price discrepancy between products`,
        statusCode: HttpStatus.BAD_REQUEST,
      });
    }

    // If stock is sufficient, proceed to create the payment
    const payment = this.paymentRepository.create({
      cart,
      user: userWithCart,
      amount,
      status: 'pending',
    });
  
    // Reduce the stock quantity of each product
    for (const item of cart.items) {
      const product = await this.productRepository.findByCondition({
        where: { id: item.product.id },
      });
      product.quantity -= item.quantity;
      await this.productRepository.save(product);
    }

    // const newCart = new ShoppingCartEntity();
    // newCart.user = userWithCart;
    userWithCart.shoppingCart = null;
    await this.userRepository.save(userWithCart);
 
    return await this.paymentRepository.save(payment);
  }
}
