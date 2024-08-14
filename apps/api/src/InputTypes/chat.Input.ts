import { Field, InputType } from "@nestjs/graphql";
import { IsInt, IsNotEmpty, Min } from "class-validator";

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