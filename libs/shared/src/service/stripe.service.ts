import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';

@Injectable()
export class StripeService {
  private stripe: Stripe;

  constructor(private readonly configService: ConfigService) {
    this.stripe = new Stripe(
      this.configService.get<string>('STRIPE_SECRET_KEY'),
      {
        apiVersion: '2024-06-20',
      },
    );
  }

  async createCharge(
    amount: number,
    currency: string,
    source: string,
    description: string,
  ) {
    return await this.stripe.charges.create({
      amount,
      currency,
      source,
      description,
    });
  }

  // Diğer Stripe işlemleri burada tanımlanabilir
}
