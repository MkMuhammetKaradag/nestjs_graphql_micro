import { User } from '@app/shared';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { Readable } from 'stream';
import * as GraphQLUpload from 'graphql-upload/GraphQLUpload.js';
@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World!';
  }

  async convertStreamToBase64(stream: Readable): Promise<string> {
    return new Promise((resolve, reject) => {
      const chunks: Buffer[] = [];
      stream.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
      stream.on('end', () => resolve(Buffer.concat(chunks).toString('base64')));
      stream.on('error', reject);
    });
  }

  async handleImageUpload(image: GraphQLUpload) {
    const { createReadStream } = await image;
    const base64String = await this.convertStreamToBase64(createReadStream());
    return base64String;
  }
}
