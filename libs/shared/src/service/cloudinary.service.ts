import { Injectable } from '@nestjs/common';
import * as cloudinary from 'cloudinary';
import { UploadApiResponse } from 'cloudinary';
import * as GraphQLUpload from 'graphql-upload/GraphQLUpload.js';
@Injectable()
export class CloudinaryService {
  async uploadImage(base64Image: string): Promise<UploadApiResponse> {
    // const { createReadStream } = await file;
    // return new Promise((resolve, reject) => {
    //   const stream = cloudinary.v2.uploader.upload_stream((error, result) => {
    //     if (result) {
    //       resolve(result);
    //     } else {
    //       reject(error);
    //     }
    //   });

    //   createReadStream().pipe(stream);
    // });
    try {
      const result = await cloudinary.v2.uploader.upload(
        `data:image/jpeg;base64,${base64Image}`,
      );
      return result; // Yüklenen görüntünün URL'sini döndürür
    } catch (error) {
      console.error('Error uploading to Cloudinary:', error);
      throw new Error('Failed to upload image to Cloudinary');
    }
  }
}
