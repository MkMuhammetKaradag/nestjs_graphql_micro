import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { ProductEntity } from './product.entity';
import { UserEntity } from './user.entity';
import { Field, ID, ObjectType } from '@nestjs/graphql';
@ObjectType()
@Entity('like')
export class LikeEntity {
  @Field(() => ID)
  @PrimaryGeneratedColumn()
  id: number;

  @Field(() => ProductEntity)
  @ManyToOne(() => ProductEntity, (product) => product.likes)
  product: ProductEntity;

  @Field(() => UserEntity)
  @ManyToOne(() => UserEntity, (user) => user.likes)
  user: UserEntity;
}
