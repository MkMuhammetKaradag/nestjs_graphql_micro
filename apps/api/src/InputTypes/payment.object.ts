import { ObjectType, Field, ID } from '@nestjs/graphql';

@ObjectType()
export class CreatePaymentIntentResponse {
  @Field()
  clientSecret: string;

  @Field()
  paymentId: number;
}
