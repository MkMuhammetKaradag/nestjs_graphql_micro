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
export class CreateProductInput {
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

@InputType()
export class GetProductDto {
  @Field()
  @IsInt()
  @Min(0)
  id: number;
}

@InputType()
export class ProductImagesUploadDto {
  @Field()
  @IsInt()
  @Min(1)
  @IsNotEmpty({ message: 'id is required.' })
  id: number;
}

@InputType()
export class AddCommentProductInput {
  @Field()
  @IsInt()
  @Min(1)
  @IsNotEmpty({ message: 'id is required.' })
  productId: number;

  @Field()
  @IsNotEmpty({ message: 'comment is required.' })
  comment: string;
}

@InputType()
export class GetCommentsInput {
  // @Field({ nullable: true })
  // @MaxLength(200, {
  //   message: 'keyword is too long',
  // })
  // keyword: string;
  @Field()
  @IsInt()
  @Min(1)
  @IsNotEmpty({ message: 'id is required.' })
  productId: number;

  @Field({ nullable: true, defaultValue: 10 })
  @IsInt()
  @Min(0)
  take?: number;

  @Field({ nullable: true, defaultValue: 0 })
  @IsInt()
  @Min(0)
  skip?: number;
}
