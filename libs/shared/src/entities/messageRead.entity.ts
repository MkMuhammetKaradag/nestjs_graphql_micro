// message-read.entity.ts
import { Entity, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { UserEntity } from './user.entity';
import { MessageEntity } from './message.entity';
import { Field, ID, ObjectType } from '@nestjs/graphql';

@ObjectType()
@Entity('messageRead')
export class MessageReadEntity {
  @Field(() => ID)
  @PrimaryGeneratedColumn()
  id: number;

  @Field(() => MessageEntity)
  @ManyToOne(() => MessageEntity, (message) => message.readStatuses)
  message: MessageEntity;

  @Field(() => UserEntity)
  @ManyToOne(() => UserEntity, (user) => user.readMessages)
  user: UserEntity;
}
