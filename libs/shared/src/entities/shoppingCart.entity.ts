import {
  Entity,
  PrimaryGeneratedColumn,
  OneToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { UserEntity } from './user.entity';
import { ShoppingCartItemEntity } from './shoppingCartItem.Entity ';
import { Exclude, Transform } from 'class-transformer';
import { Field, ID, ObjectType } from '@nestjs/graphql';
import { PaymentEntity } from './payment.entity';

@ObjectType()
@Entity('shopping_cart')
export class ShoppingCartEntity {
  @Field(() => ID)
  @PrimaryGeneratedColumn()
  id: number;

  @Field(() => UserEntity)
  @OneToOne(() => UserEntity, (user) => user.shoppingCart)
  @JoinColumn()
  user: UserEntity;

  @Field(() => [ShoppingCartItemEntity])
  @OneToMany(() => ShoppingCartItemEntity, (item) => item.cart, {
    cascade: true,
  })
  @Exclude() // ShoppingCartItemEntity ve ShoppingCartEntity içinde döngüsel referansları dışlayın:
  items: ShoppingCartItemEntity[];

  @Field(() => [PaymentEntity])
  @OneToMany(() => PaymentEntity, (payment) => payment.cart)
  payments: PaymentEntity[];

  toJSON() {
    const { user, ...rest } = this;
    return rest;
  }
}
