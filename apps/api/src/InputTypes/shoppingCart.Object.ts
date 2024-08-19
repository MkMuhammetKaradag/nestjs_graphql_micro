import { Field, ObjectType } from '@nestjs/graphql';
import { ShoppingCart } from '../entities/shoppingCart.entity';
import { ErrorType } from './user-object';
import { Product } from '../entities/product.entity';

@ObjectType()
export class GetSoppingCartResponse {
  @Field(() => ShoppingCart, { nullable: true })
  shoppingCart?: ShoppingCart;

  @Field(() => ErrorType, { nullable: true })
  error?: ErrorType;
}

@ObjectType()
export class AddSoppingCartResponse {
  @Field()
  id: number;

  @Field(() => Product, { nullable: true })
  product?: Product;

  @Field(() => ErrorType, { nullable: true })
  error?: ErrorType;
}
