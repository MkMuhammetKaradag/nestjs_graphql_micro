import { InputType, Field, ObjectType } from '@nestjs/graphql';

@InputType()
export class UserRegisterInput {
  @Field()
  firstName: string;
  @Field()
  lastName: string;
  @Field()
  email: string;
  @Field()
  password: string;
}

@InputType()
export class UserLoginInput {
  @Field()
  email: string;
  @Field()
  password: string;
}
