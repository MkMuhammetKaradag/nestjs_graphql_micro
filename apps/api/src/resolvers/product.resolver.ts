import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';

import { ClientProxy } from '@nestjs/microservices';

import {
  AuthGuard,
  CloudinaryService,
  PUB_SUB,
  Roles,
  RolesGuard,
} from '@app/shared';

import { RedisPubSub } from 'graphql-redis-subscriptions';
import { BadRequestException, Inject, UseGuards } from '@nestjs/common';
import { CreateProductsResponse } from '../InputTypes/product.object';
import {
  CreateProductDto,
  GetProductsDto,
  ProductImagesUploadDto,
} from '../InputTypes/product.Input';
import {
  GetProductsResponse,
  UploadImagesResponse,
} from '../InputTypes/user-object';

import * as GraphQLUpload from 'graphql-upload/GraphQLUpload.js';
import { ApolloError } from 'apollo-server-express';
import { v4 as uuidv4 } from 'uuid';
import { join } from 'path';
import { createWriteStream, existsSync, mkdirSync } from 'fs';
import { Readable } from 'stream';
import { REQUEST } from '@nestjs/core';
@Resolver('product')
export class ProductResolver {
  constructor(
    @Inject('AUTH_SERVICE')
    private readonly authService: ClientProxy,

    @Inject('PRODUCT_SERVICE')
    private readonly productService: ClientProxy,

    @Inject(PUB_SUB) private pubSub: RedisPubSub,

    private cloudinary: CloudinaryService,
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

  @Query(() => GetProductsResponse)
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('admin')
  async getMyProducts(
    @Args('getProductsDto') getProducts: GetProductsDto,
    @Context() context,
  ) {
    const { req, res } = context;
    if (!req?.user) {
      throw new BadRequestException();
    }
    return this.productService.send(
      {
        cmd: 'get-myProducts',
      },
      {
        ...getProducts,
        userId: req.user.id,
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
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('admin')
  async productImagesUpload(
    @Args('productImagesUploadDto')
    productImagesUploadDto: ProductImagesUploadDto,
    @Args({
      name: 'images',
      type: () => [GraphQLUpload],
      nullable: 'itemsAndList',
    })
    images: GraphQLUpload[],
    @Context() context,
  ) {
    const { req, res } = context;
    if (!req?.user) {
      throw new ApolloError('user is required', 'USER_REQUIRED');
    }
    if (!images) throw new ApolloError('Image is required', 'IMAGE_REQUIRED');
    const allowedTypes = ['image/jpeg', 'image/png'];
    const imageBase64Strings = (
      await Promise.all(
        images.map(async (image) => {
          const { mimetype } = await image;
          if (!allowedTypes.includes(mimetype)) {
            return null;
          }
          return await this.handleImageUpload(image);
        }),
      )
    ).filter((item) => item !== null);
    console.log(imageBase64Strings.length);
    return this.productService.send(
      {
        cmd: 'upload-product-images',
      },
      {
        images: imageBase64Strings,
        productId: productImagesUploadDto.id,
        userId: req.user.id,
      },
    );
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
