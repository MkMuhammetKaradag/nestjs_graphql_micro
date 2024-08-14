import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  ManyToMany,
  JoinTable,
  OneToMany,
} from 'typeorm';
import { ObjectType, Field, ID, GraphQLISODateTime } from '@nestjs/graphql';
import { UserEntity } from './user.entity';
import { ChatEntity } from './chat.entity';
import { MessageReadEntity } from './messageRead.entity';

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

  @Field(() => [MessageReadEntity])
  @OneToMany(() => MessageReadEntity, (messageRead) => messageRead.message)
  readStatuses: MessageReadEntity[];

  @Field(() => String)
  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;
}
