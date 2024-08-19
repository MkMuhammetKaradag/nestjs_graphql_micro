import { Field, InputType } from '@nestjs/graphql';
import { IsInt, IsNotEmpty, Min } from 'class-validator';

@InputType()
export class CreatePaymentInput {
  @Field()
  @IsInt()
  @Min(1)
  @IsNotEmpty({ message: 'id is required.' })
  cartId: number;

  @Field()
  @IsInt()
  @Min(1)
  @IsNotEmpty({ message: 'payment id is required.' })
  paymentId: number;

  @Field()
  @IsInt()
  @Min(1)
  @IsNotEmpty({ message: 'id is required.' })
  amount: number;

  @Field()
  @IsNotEmpty({ message: 'comment is required.' })
  source: string;
}

@InputType()
export class CreatePaymentIntentInput {
  @Field()
  @IsInt()
  @Min(1)
  @IsNotEmpty({ message: 'id is required.' })
  cartId: number;

  @Field()
  @IsInt()
  @Min(1)
  @IsNotEmpty({ message: 'id is required.' })
  amount: number;
}
