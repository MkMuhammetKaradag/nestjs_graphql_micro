import {
  Column,
  Entity,
  JoinColumn,
  ManyToMany,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ProductEntity } from './product.entity';
import { CommentEntity } from './comment.entity';
import { LikeEntity } from './like.entity';
import { ShoppingCartEntity } from './shoppingCart.entity';
import { Exclude } from 'class-transformer';
import { ChatEntity } from './chat.entity';
import { Field, ID, ObjectType } from '@nestjs/graphql';
import { MessageReadEntity } from './messageRead.entity';
import { PaymentEntity } from './payment.entity';

@ObjectType()
@Entity('user')
export class UserEntity {
  @Field(() => ID)
  @PrimaryGeneratedColumn()
  id: number;

  @Field()
  @Column()
  firstName: string;

  @Field()
  @Column()
  lastName: string;

  @Field(() => [String])
  @Column('text', { array: true, default: ['user'] }) // Varsayılan rol 'user'
  roles: string[];

  @Field()
  @Column({ unique: true })
  email: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  profilPhoto: string;

  @Field()
  @Column({ select: false })
  password: string;

  @Field()
  @Column({ default: false })
  isOnline: boolean;

  @Field(() => [ProductEntity])
  @OneToMany(() => ProductEntity, (productEntity) => productEntity.vendor)
  products: ProductEntity[];

  @Field(() => ShoppingCartEntity)
  @OneToOne(() => ShoppingCartEntity, (shoppingCart) => shoppingCart.user, {
    cascade: true,
  })
  @Exclude()
  shoppingCart: ShoppingCartEntity;

  @Field()
  @UpdateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updatedAt: Date;

  @Field(() => [CommentEntity])
  @OneToMany(() => CommentEntity, (comment) => comment.user)
  comments: CommentEntity[];

  @Field(() => [LikeEntity])
  @OneToMany(() => LikeEntity, (like) => like.user)
  likes: LikeEntity[];

  @Field(() => [ChatEntity])
  @ManyToMany(() => ChatEntity, (chat) => chat.users)
  chats: ChatEntity[];

  @Field(() => [MessageReadEntity])
  @OneToMany(() => MessageReadEntity, (messageRead) => messageRead.user)
  readMessages: MessageReadEntity[];

  @Field(() => [PaymentEntity])
  @OneToMany(() => PaymentEntity, (payment) => payment.user)
  payments: PaymentEntity[];
}
