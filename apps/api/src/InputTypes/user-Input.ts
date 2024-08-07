import { InputType, Field, ObjectType } from '@nestjs/graphql';
import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';
// import { IsNotEmpty, IsString, MinLength } from 'class-validator';

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
  @Field((type) => [String], { nullable: true })
  roles?: string[];
}

@InputType()
export class UserLoginInput {
  @Field()
  // @IsNotEmpty({ message: 'Password is Required' })
  // @IsString({ message: 'Password must need to be one strring' })
  email: string;

  @Field()
  // @IsNotEmpty({ message: 'Password is Required' })
  // @MinLength(6, { message: 'password must be at least 6 characters..' })
  // @IsString({ message: 'Password must need to be one strring' })
  password: string;
}

@InputType()
export class ActivationInput {
  @Field()
  // @IsNotEmpty({ message: 'activation token is Required' })
  activationToken: string;

  @Field()
  // @IsNotEmpty({ message: 'activation code is Required' })w
  activationCode: string;
}

@InputType()
export class ForgotPasswordInput {
  @Field()
  @IsNotEmpty({ message: 'Email is required.' })
  @IsEmail({}, { message: 'Email must be valid.' })
  email: string;
}


@InputType()
export class ResetPasswordInput {
  @Field()
  @IsNotEmpty({ message: 'Password is required.' })
  @MinLength(8, { message: 'Password must be at least 8 characters.' })
  password: string;

  @Field()
  @IsNotEmpty({ message: 'Activation Token is required.' })
  activationToken: string;
}