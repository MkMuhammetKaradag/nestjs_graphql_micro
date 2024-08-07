import {
    Column,
    Entity,
    ManyToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
  } from 'typeorm';
  import { ProductEntity } from './product.entity';
  import { UserEntity } from './user.entity';
  
  @Entity('comment')
  export class CommentEntity {
    @PrimaryGeneratedColumn()
    id: number;
  
    @Column()
    text: string;
  
    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    createdAt: Date;

    @UpdateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
    updatedAt: Date;
  
    @ManyToOne(() => ProductEntity, (product) => product.comments)
    product: ProductEntity;
  
    @ManyToOne(() => UserEntity, (user) => user.comments)
    user: UserEntity;
  }
  