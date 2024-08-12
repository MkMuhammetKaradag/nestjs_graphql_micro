import { ObjectType, Field, Directive } from '@nestjs/graphql';
import { Product } from './product.entity';
import { Comment } from './comment.entity';
import { User } from './user.entity';
import { ShoppingCartItem } from './ShoppingCartItem.entity';
@ObjectType()
export class ShoppingCart {
  @Field()
  id: number;
  @Field((type) => [ShoppingCartItem], { nullable: true })
  items?: ShoppingCartItem[];

  @Field((type) => User, { nullable: true })
  user?: User;
}
