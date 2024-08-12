import { Field, InputType } from '@nestjs/graphql';
import { IsInt, Min } from 'class-validator';

@InputType()
export class GetShoppingCartInput {
  @Field()
  id: number;
}

@InputType()
export class AddShoppingCartProductInput {
  @Field()
  productId: number;
}
