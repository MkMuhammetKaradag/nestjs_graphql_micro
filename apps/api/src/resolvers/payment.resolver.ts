import {
  AuthGuard,
  PaymentEntity,
  Roles,
  RolesGuard,
  StripeService,
} from '@app/shared';
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
import {
  CreatePaymentInput,
  CreatePaymentIntentInput,
} from '../InputTypes/payment.Input';

Resolver('payment');
export class PaymentResolver {
  constructor(
    @Inject('PAYMENT_SERVICE')
    private readonly paymentService: ClientProxy,

    private readonly stripeService: StripeService,
  ) {}

  @Mutation(() => PaymentEntity)
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('user')
  async createPayment(
    @Args('createPaymentInput') createPaymentInput: CreatePaymentInput,

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
            cartId: createPaymentInput.cartId,
            userId: req.user.id,
            amount: createPaymentInput.amount,
            source: createPaymentInput.source,
          },
        ),
      );
      return payment;
    } catch (error) {
      console.log(createPaymentInput.source);
      // await this.stripeService.cancelPaymentIntent(createPaymentInput.source);
      throw new GraphQLError(error.message, {
        extensions: { ...error },
      });
    }
  }

  @Mutation(() => String)
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('user')
  async createPaymentIntent(
    @Args('createPaymentIntentInput')
    createPaymentIntentInput: CreatePaymentIntentInput,

    @Context() context,
  ): Promise<string> {
    const { req, res } = context;
    if (!req?.user) {
      throw new BadRequestException();
    }
    try {
      const payment = await firstValueFrom<string>(
        this.paymentService.send(
          {
            cmd: 'create-payment-intent',
          },
          {
            userId: req.user.id,
            amount: createPaymentIntentInput.amount,
            cartdId: createPaymentIntentInput.cartId,
          },
        ),
      );
      return payment;
    } catch (error) {
      throw new GraphQLError(error.message, {
        extensions: { ...error },
      });
    }
    // const paymentIntent = await this.stripe.paymentIntents.create({
    //   amount,
    //   currency,
    // });

    // return paymentIntent.client_secret;
  }
}
