import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToMany,
  JoinTable,
  OneToMany,
} from 'typeorm';
import { ObjectType, Field, ID } from '@nestjs/graphql';
import { UserEntity } from './user.entity';
import { MessageEntity } from './message.entity';
@ObjectType()
@Entity('chat')
export class ChatEntity {
  @Field(() => ID)
  @PrimaryGeneratedColumn()
  id: number;

  @Field(() => [UserEntity])
  @ManyToMany(() => UserEntity, (user) => user.chats)
  @JoinTable()
  users: UserEntity[];

  @Field(() => [MessageEntity], { nullable: true })
  @OneToMany(() => MessageEntity, (message) => message.chat)
  messages: MessageEntity[];
}
