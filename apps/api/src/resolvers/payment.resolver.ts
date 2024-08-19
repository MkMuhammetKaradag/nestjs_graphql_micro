import { AuthGuard, PaymentEntity, Roles, RolesGuard } from '@app/shared';
import { BadRequestException, Inject, UseGuards } from '@nestjs/common';
import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { ShoppingCart } from '../entities/shoppingCart.entity';
import {
  AddSoppingCartResponse,
  GetSoppingCartResponse,
} from '../InputTypes/shoppingCart.Object';
import {
  AddShoppingCartProductInput,
  GetShoppingCartInput,
} from '../InputTypes/shoppingCart.Input';
import { GraphQLError } from 'graphql';

Resolver('payment');
export class PaymentResolver {
  constructor(
    @Inject('PAYMENT_SERVICE')
    private readonly paymentService: ClientProxy,
  ) {}

  @Mutation(() => PaymentEntity)
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('user')
  async createPayment(
    @Args('cartId') cartId: number,
    @Args('amount') amount: number,
    @Args('source') source: string,
    @Context() context,
  ): Promise<PaymentEntity> {
    const { req, res } = context;
    if (!req?.user) {
      throw new BadRequestException();
    }
    try {
      const payment = await firstValueFrom<PaymentEntity>(
        this.paymentService.send(
          {
            cmd: 'create-payment',
          },
          {
            cartId: cartId,
            userId: req.user.id,
            amount: amount,
            source: source,
          },
        ),
      );
      return payment;
    } catch (error) {
      throw new GraphQLError(error.message, {
        extensions: { ...error },
      });
    }
  }
}
