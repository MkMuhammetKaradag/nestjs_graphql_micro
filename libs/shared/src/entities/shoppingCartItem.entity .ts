import { Entity, ManyToOne, PrimaryGeneratedColumn, Column } from 'typeorm';
import { ProductEntity } from './product.entity';
import { ShoppingCartEntity } from './shoppingCart.entity';
import { Exclude } from 'class-transformer';

@Entity('shopping_cart_item')
export class ShoppingCartItemEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => ShoppingCartEntity, (cart) => cart.items)
  @Exclude() // ShoppingCartItemEntity ve ShoppingCartEntity içinde döngüsel referansları dışlayın:
  cart: ShoppingCartEntity;

  @ManyToOne(() => ProductEntity)
  product: ProductEntity;

  @Column('int')
  quantity: number;

  toJSON() {
    const { cart, ...rest } = this;
    return rest;
  }
}
