import { Field, ObjectType } from '@nestjs/graphql';
import { ErrorType } from './user-object';
import { MessageEntity } from '@app/shared';

@ObjectType()
export class GetMessagesResponse {
  @Field(() => [MessageEntity], { nullable: true })
  messages: MessageEntity[];
  @Field({ nullable: true })
  total: number;
  @Field(() => ErrorType, { nullable: true })
  error?: ErrorType;
}
