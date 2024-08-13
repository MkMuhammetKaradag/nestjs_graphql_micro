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
import { Field, ID, ObjectType } from '@nestjs/graphql';
@ObjectType()
@Entity('product')
export class ProductEntity {
  @Field(() => ID)
  @PrimaryGeneratedColumn()
  id: number;

  @Field()
  @Column()
  description: string;

  @Field()
  @Column()
  price: number;

  @Field()
  @Column()
  quantity: number;

  // @ArrayMaxSize(1, {
  //   message: 'The images array cannot contain more than 3 elements.',
  // })
  @Field(() => [String])
  @Column({ type: 'text', array: true, nullable: true })
  images: string[];

  @Field()
  @Column()
  name: string;

  @Field()
  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Field()
  @UpdateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updatedAt: Date;

  @Field(() => UserEntity)
  @ManyToOne(() => UserEntity, (userEntity) => userEntity.products)
  vendor: UserEntity;

  @Field(() => [CommentEntity])
  @OneToMany(() => CommentEntity, (comment) => comment.product)
  comments: CommentEntity[];

  @Field(() => [LikeEntity])
  @OneToMany(() => LikeEntity, (like) => like.product)
  likes: LikeEntity[];
}
