import { ObjectType, Field, Directive } from '@nestjs/graphql';
import { Product } from './product.entity';
import { Comment } from './comment.entity';
import { User } from './user.entity';
@ObjectType()
export class ShoppingCartItem {
  @Field()
  id: number;
  @Field((type) => Product, { nullable: true })
  product?: Product;

  @Field()
  quantity: number;

 
}
