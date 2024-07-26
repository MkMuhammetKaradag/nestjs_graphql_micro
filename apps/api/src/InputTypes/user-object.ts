import { InputType, Field, ObjectType } from '@nestjs/graphql';
import { User } from '../entities/user.entity';

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
