import * as GraphQLUpload from 'graphql-upload/GraphQLUpload.js';
export class UploadProductImagesDTO {
  images: string[];
  productId: number;
  userId: number;
}
