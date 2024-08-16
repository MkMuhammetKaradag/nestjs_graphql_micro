import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
  } from 'typeorm';
  import { ShoppingCartEntity } from './shoppingCart.entity';
  import { UserEntity } from './user.entity';
  import { Field, ID, ObjectType } from '@nestjs/graphql';
  
  @ObjectType()
  @Entity('payment')
  export class PaymentEntity {
    @Field(() => ID)
    @PrimaryGeneratedColumn()
    id: number;
  
    @Field()
    @Column()
    amount: number;
  
    @Field()
    @Column()
    currency: string;
  
    @Field()
    @Column({ default: 'pending' })
    status: string;
  
    @Field()
    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    createdAt: Date;
  
    @Field(() => UserEntity)
    @ManyToOne(() => UserEntity, (user) => user.payments)
    user: UserEntity;
  
    @Field(() => ShoppingCartEntity)
    @ManyToOne(() => ShoppingCartEntity, (cart) => cart.payments)
    cart: ShoppingCartEntity;
  }
  