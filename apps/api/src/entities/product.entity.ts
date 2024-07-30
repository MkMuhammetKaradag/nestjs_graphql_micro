import { ObjectType, Field, Directive } from '@nestjs/graphql';
@ObjectType()
export class Product {
  @Field()
  id: number;

  @Field()
  name: string;
  
  @Field()
  price: number;
}
