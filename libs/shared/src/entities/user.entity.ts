import {
  Column,
  Entity,
  JoinColumn,
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

@Entity('user')
export class UserEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column('text', { array: true, default: ['user'] }) // Varsayılan rol 'user'
  roles: string[];

  @Column({ unique: true })
  email: string;

  @Column({ nullable: true })
  profilPhoto: string;

  @Column({ select: false })
  password: string;

  @OneToMany(() => ProductEntity, (productEntity) => productEntity.vendor)
  products: ProductEntity[];

  @OneToOne(() => ShoppingCartEntity, (shoppingCart) => shoppingCart.user, {
    cascade: true,
  })
  @Exclude()
  shoppingCart: ShoppingCartEntity;

  @UpdateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updatedAt: Date;

  @OneToMany(() => CommentEntity, (comment) => comment.user)
  comments: CommentEntity[];

  @OneToMany(() => LikeEntity, (like) => like.user)
  likes: LikeEntity[];
}
