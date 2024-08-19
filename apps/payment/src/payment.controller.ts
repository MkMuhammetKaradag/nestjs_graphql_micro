import { Controller, Get, Inject } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { SharedService } from '@app/shared';
import {
  Ctx,
  MessagePattern,
  Payload,
  RmqContext,
} from '@nestjs/microservices';

@Controller()
export class PaymentController {
  constructor(
    private readonly paymentService: PaymentService,
    @Inject('SharedServiceInterface')
    private readonly sharedService: SharedService,
  ) {}

  @Get()
  getHello(): string {
    return this.paymentService.getHello();
  }

  @MessagePattern({ cmd: 'create-payment' })
  async createPayment(
    @Ctx() context: RmqContext,
    @Payload()
    createdPaymentDto: {
      cartId: number;
      userId: number;
      amount: number;
      source: string;
    },
  ) {
    this.sharedService.acknowledgeMessage(context);

    return this.paymentService.createPayment(createdPaymentDto);
  }

  @MessagePattern({ cmd: 'create-payment-intent' })
  async createPaymentIntent(
    @Ctx() context: RmqContext,
    @Payload()
    createdPaymentDto: {
      cartId: number;
      userId: number;
      amount: number;
    },
  ) {
    this.sharedService.acknowledgeMessage(context);

    return this.paymentService.createPaymentIntent(createdPaymentDto);
  }
}
