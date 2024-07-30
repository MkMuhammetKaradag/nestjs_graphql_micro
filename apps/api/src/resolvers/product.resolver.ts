import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';

import { ClientProxy } from '@nestjs/microservices';

import { AuthGuard, PUB_SUB, Roles, RolesGuard } from '@app/shared';

import { RedisPubSub } from 'graphql-redis-subscriptions';
import { BadRequestException, Inject, UseGuards } from '@nestjs/common';
import { CreateProductsResponse } from '../InputTypes/product.object';
import { CreateProductDto, GetProductsDto } from '../InputTypes/product.Input';
import {
  GetProductsResponse,
  UploadImagesResponse,
} from '../InputTypes/user-object';

import * as GraphQLUpload from 'graphql-upload/GraphQLUpload.js';
import { ApolloError } from 'apollo-server-express';
import { v4 as uuidv4 } from 'uuid';
import { join } from 'path';
import { createWriteStream, existsSync, mkdirSync } from 'fs';

@Resolver('product')
export class ProductResolver {
  constructor(
    @Inject('AUTH_SERVICE')
    private readonly authService: ClientProxy,

    @Inject('PRODUCT_SERVICE')
    private readonly productService: ClientProxy,

    @Inject(PUB_SUB) private pubSub: RedisPubSub,
  ) {}
  @Query(() => GetProductsResponse)
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('admin')
  async getProducts(@Args('getProductsDto') getProducts: GetProductsDto) {
    return this.productService.send(
      {
        cmd: 'get-product',
      },
      {
        ...getProducts,
      },
    );
  }
  @Mutation(() => CreateProductsResponse)
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('admin')
  async createProduct(
    @Args('createProductDto') createProduct: CreateProductDto,
    @Context() context,
  ) {
    const { req, res } = context;
    if (!req?.user) {
      throw new BadRequestException();
    }
    return this.productService.send(
      {
        cmd: 'create-product',
      },
      {
        ...createProduct,
        userId: req.user.id,
      },
    );
  }

  @Mutation(() => UploadImagesResponse)
  // @UseGuards(AuthGuard, RolesGuard)
  // @Roles('admin')
  async addPhoto(
    @Args({ name: 'images', type: () => [GraphQLUpload] })
    images: GraphQLUpload[],
  ) {
    if (!images) throw new ApolloError('Image is required', 'IMAGE_REQUIRED');
    let urls = [];
    try {
      urls = await Promise.all(
        images.map(async (image) => await this.storeImageAndGetUrl(image)),
      );
    } catch (error) {
      console.error(error);
      throw new ApolloError('Error uploading image', 'IMAGE_UPLOAD_ERROR');
    }

    return {
      images: urls,
    };
  }

  async storeImageAndGetUrl(file: GraphQLUpload) {
    const { createReadStream, filename } = await file;
    const uniqueFilename = `${uuidv4()}_${filename}`;
    const imagePath = join(
      process.cwd(),
      'apps',
      'api',
      'public',
      'images',
      uniqueFilename,
    );
    const imageUrl = `http://localhost:${process.env.API_PORT}/images/${uniqueFilename}`;
    console.log(imagePath);
    if (!existsSync(join(process.cwd(), 'apps', 'api', 'public', 'images'))) {
      mkdirSync(join(process.cwd(),'apps','api', 'public', 'images'), { recursive: true });
    }

    const readStream = createReadStream();
    readStream.pipe(createWriteStream(imagePath));
    return imageUrl;
  }
}
