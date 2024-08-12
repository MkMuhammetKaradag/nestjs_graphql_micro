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

@Entity('shopping_cart')
export class ShoppingCartEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => UserEntity, (user) => user.shoppingCart)
  @JoinColumn()
  user: UserEntity;

  @OneToMany(() => ShoppingCartItemEntity, (item) => item.cart, {
    cascade: true,
  })
  // @Transform(({ value }) => value.map((item) => ({ ...item, cart: undefined })))
  @Exclude()
  items: ShoppingCartItemEntity[];

  toJSON() {
    const { user, ...rest } = this;
    return rest;
  }
}
