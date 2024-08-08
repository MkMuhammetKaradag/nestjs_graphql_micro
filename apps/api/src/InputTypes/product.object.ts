import { Field, ObjectType } from '@nestjs/graphql';
import { Product } from '../entities/product.entity';
import { ErrorType } from './user-object';
import { Comment } from '../entities/comment.entity';

@ObjectType()
export class CreateProductsResponse {
  @Field(() => Product, { nullable: true })
  product: Product;

  @Field(() => ErrorType, { nullable: true })
  error?: ErrorType;
}

@ObjectType()
export class AddCommentProductResponse {
  @Field(() => Comment, { nullable: true })
  comment: Comment;

  @Field(() => ErrorType, { nullable: true })
  error?: ErrorType;
}

@ObjectType()
export class GetCommentsResponse {
  @Field(() => [Comment], { nullable: true })
  comments: Comment[];
  @Field({ nullable: true })
  total: number;
  @Field(() => ErrorType, { nullable: true })
  error?: ErrorType;
}
