import { InputType, Field, ObjectType } from '@nestjs/graphql';
import { User } from '../entities/user.entity';
import { Product } from '../entities/product.entity';

@ObjectType()
export class ErrorType {
  @Field()
  message: string;

  @Field({ nullable: true })
  code?: string;
}
@ObjectType()
export class UserLoginResponse {
  @Field()
  user: User;
  @Field()
  token: string;

  @Field(() => ErrorType, { nullable: true })
  error?: ErrorType;
}

@ObjectType()
export class RegisterResponse {
  @Field()
  activation_token: string;

  @Field(() => ErrorType, { nullable: true })
  error?: ErrorType;
}

@ObjectType()
export class ActivationResponse {
  @Field(() => User, { nullable: true })
  user: User | any;

  @Field(() => ErrorType, { nullable: true })
  error?: ErrorType;
}

@ObjectType()
export class ForgotPasswordResponse {
  @Field()
  message: string;

  @Field(() => ErrorType, { nullable: true })
  error?: ErrorType;
}
@ObjectType()
export class ResetPasswordResponse {
  @Field(() => User)
  user: User | unknown;

  @Field(() => ErrorType, { nullable: true })
  error?: ErrorType;
}

@ObjectType()
export class GetProductsResponse {
  @Field(() => [Product], { nullable: true })
  products: Product[];
  @Field({ nullable: true })
  total: number;
  @Field(() => ErrorType, { nullable: true })
  error?: ErrorType;
}

@ObjectType()
export class UploadImagesResponse {
  @Field((type) => Product, { nullable: true })
  product: Product;

  @Field(() => ErrorType, { nullable: true })
  error?: ErrorType;
}
