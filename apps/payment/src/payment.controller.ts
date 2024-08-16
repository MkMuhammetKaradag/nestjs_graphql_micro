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
  async getUserChats(
    @Ctx() context: RmqContext,
    @Payload()
    createdPaymentDto: {
      userId: number;
    },
  ) {
    this.sharedService.acknowledgeMessage(context);
    return 'payment success';
  }
}
