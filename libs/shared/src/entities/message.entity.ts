import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { ObjectType, Field, ID } from '@nestjs/graphql';
import { UserEntity } from './user.entity';
import { ChatEntity } from './chat.entity';
@ObjectType()
@Entity('message')
export class MessageEntity {
  @Field(() => ID)
  @PrimaryGeneratedColumn()
  id: number;

  @Field()
  @Column()
  content: string;

  @Field(() => UserEntity)
  @ManyToOne(() => UserEntity, (user) => user.id)
  sender: UserEntity;

  @Field(() => ChatEntity)
  @ManyToOne(() => ChatEntity, (chat) => chat.messages)
  chat: ChatEntity;

  // @Field()
  @Column({ default: false })
  isRead: boolean;

  @Field()
  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;
}
