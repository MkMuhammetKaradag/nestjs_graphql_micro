import { ObjectType, Field, Directive } from '@nestjs/graphql';
import { User } from './user.entity';
import { Comment } from './comment.entity';
@ObjectType()
export class Product {
  @Field()
  id: number;

  @Field()
  description: string;

  @Field()
  price: number;

  @Field()
  quantity: number;

  @Field((type) => [String], { nullable: true })
  images?: string[];

  @Field()
  name: string;

  @Field((type) => User, { nullable: true })
  vendor?: User;

  @Field((type) => [Comment], { nullable: true })
  comments?: Comment[];
}
