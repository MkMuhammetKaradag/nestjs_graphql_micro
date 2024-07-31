import {
  Column,
  Entity,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { UserEntity } from './user.entity';
import { ArrayMaxSize } from 'class-validator';

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

  @ManyToOne(() => UserEntity, (userEntity) => userEntity.products)
  vendor: UserEntity;
}
