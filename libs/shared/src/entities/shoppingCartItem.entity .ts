import { Entity, ManyToOne, PrimaryGeneratedColumn, Column } from 'typeorm';
import { ProductEntity } from './product.entity';
import { ShoppingCartEntity } from './shoppingCart.entity';
import { Exclude } from 'class-transformer';
import { Field, ID, ObjectType } from '@nestjs/graphql';

@ObjectType() // Eksik olan ObjectType dekoratörü eklenmiş
@Entity('shopping_cart_item')
export class ShoppingCartItemEntity {
  @Field(() => ID)
  @PrimaryGeneratedColumn()
  id: number;

  @Field(() => ShoppingCartEntity)
  @ManyToOne(() => ShoppingCartEntity, (cart) => cart.items)
  @Exclude() // ShoppingCartItemEntity ve ShoppingCartEntity içinde döngüsel referansları dışlayın:
  cart: ShoppingCartEntity;

  @Field(() => ProductEntity)
  @ManyToOne(() => ProductEntity)
  product: ProductEntity;

  @Field()
  @Column('int')
  quantity: number;

  toJSON() {
    const { cart, ...rest } = this;
    return rest;
  }
}
