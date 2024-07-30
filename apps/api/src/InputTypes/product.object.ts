import { Field, ObjectType } from '@nestjs/graphql';
import { Product } from '../entities/product.entity';
import { ErrorType } from './user-object';

@ObjectType()
export class CreateProductsResponse {
  @Field(() => Product, { nullable: true })
  product: Product;

  @Field(() => ErrorType, { nullable: true })
  error?: ErrorType;
}
