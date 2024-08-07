import { ObjectType, Field, Directive } from '@nestjs/graphql';
import { Product } from './product.entity';
import { User } from './user.entity';
@ObjectType()
export class Comment {
  @Field()
  id: number;

  @Field()
  text: string;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;

  @Field((type) => User, { nullable: true })
  user?: User;

  @Field((type) => Product, { nullable: true })
  product?: Product;
}
