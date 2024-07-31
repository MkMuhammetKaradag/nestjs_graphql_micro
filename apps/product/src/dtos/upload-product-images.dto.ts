import { ArrayMaxSize, MaxLength, MinLength } from 'class-validator';
import * as GraphQLUpload from 'graphql-upload/GraphQLUpload.js';
export class UploadProductImagesDTO {
  // @ArrayMaxSize(1, {
  //   message: 'The images array cannot contain more than 3 elements.',
  // })
  images: string[];
  productId: number;
  userId: number;
}
