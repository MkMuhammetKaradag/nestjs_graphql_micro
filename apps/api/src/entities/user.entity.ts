import { ObjectType, Field, Directive } from '@nestjs/graphql';
import { Product } from './product.entity';
import { Comment } from './comment.entity';
@ObjectType()
export class User {
  @Field()
  id: number;

  @Field()
  firstName: string;
  @Field()
  lastName: string;
  @Field()
  email: string;
  @Field()
  password: string;

  @Field({ nullable: true })
  profilPhoto?: string;

  @Field((type) => [String], { nullable: true })
  roles?: string[];

  @Field((type) => [Product], { nullable: true })
  products?: Product[];

  @Field((type) => [Comment], { nullable: true })
  comments?: Comment[];
}
