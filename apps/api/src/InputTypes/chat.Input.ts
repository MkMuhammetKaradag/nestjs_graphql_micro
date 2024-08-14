import { Field, InputType } from '@nestjs/graphql';
import { IsInt, IsNotEmpty, Min } from 'class-validator';

@InputType()
export class SendMessageInput {
  @Field()
  @IsInt()
  @Min(1)
  @IsNotEmpty({ message: 'id is required.' })
  chatId: number;

  @Field()
  @IsNotEmpty({ message: 'comment is required.' })
  content: string;
}

@InputType()
export class MarkMessageAsReadInput {
  @Field()
  @IsInt()
  @Min(1)
  @IsNotEmpty({ message: 'id is required.' })
  messageId: number;
}

@InputType()
export class GetMessagesInput {
  @Field()
  @IsInt()
  @Min(1)
  @IsNotEmpty({ message: 'id is required.' })
  chatId: number;

  @Field()
  @IsInt()
  @IsNotEmpty({ message: 'id is required.' })
  take: number;

  @Field()
  @IsInt()
  @IsNotEmpty({ message: 'id is required.' })
  skip: number;
}
