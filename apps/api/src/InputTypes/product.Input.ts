import { InputType, Field, ObjectType } from '@nestjs/graphql';
import {
  IsEmail,
  IsInt,
  IsNotEmpty,
  IsNumber,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
// import { IsNotEmpty, IsString, MinLength } from 'class-validator';

@InputType()
export class CreateProductDto {
  @Field()
  @IsNotEmpty({ message: 'description is required.' })
  @MaxLength(200, {
    message: 'description is too long',
  })
  description: string;

  @Field()
  @IsNotEmpty({ message: 'price is required.' })
  @IsInt()
  @Min(0)
  @Max(1000)
  price: number;

  @Field()
  @IsNotEmpty({ message: 'quantity is required.' })
  @IsInt()
  @Min(0)
  @Max(1000)
  quantity: number;

  @Field()
  @IsNotEmpty({ message: 'name is required.' })
  @MinLength(3, {
    message: 'name is too short',
  })
  @MaxLength(50, {
    message: 'name is too long',
  })
  name: string;
}

@InputType()
export class GetProductsDto {
  @Field({ nullable: true })
  @MaxLength(200, {
    message: 'description is too long',
  })
  keyword: string;

  @Field({ nullable: true })
  @IsInt()
  @Min(0)
  take: number;

  @Field({ nullable: true })
  @IsInt()
  @Min(0)
  skip: number;
}
