import {
  Column,
  Entity,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { UserEntity } from './user.entity';
import { ArrayMaxSize } from 'class-validator';
import { CommentEntity } from './comment.entity';
import { LikeEntity } from './like.entity';

@Entity('product')
export class ProductEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  description: string;

  @Column()
  price: number;

  @Column()
  quantity: number;

  // @ArrayMaxSize(1, {
  //   message: 'The images array cannot contain more than 3 elements.',
  // })
  @Column({ type: 'text', array: true, nullable: true })
  images: string[];

  @Column()
  name: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  
  @UpdateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updatedAt: Date;

  @ManyToOne(() => UserEntity, (userEntity) => userEntity.products)
  vendor: UserEntity;


  @OneToMany(() => CommentEntity, (comment) => comment.product)
  comments: CommentEntity[];

  @OneToMany(() => LikeEntity, (like) => like.product)
  likes: LikeEntity[];
}
