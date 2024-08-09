import {
  Args,
  Context,
  Mutation,
  Query,
  Resolver,
  Subscription,
} from '@nestjs/graphql';

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
import {
  AddCommentProductResponse,
  CreateProductsResponse,
  GetCommentsResponse,
} from '../InputTypes/product.object';
import {
  AddCommentProductInput,
  CreateProductInput,
  GetCommentsInput,
  GetProductDto,
  GetProductsDto,
  ProductImagesUploadDto,
} from '../InputTypes/product.Input';
import {
  GetProductResponse,
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
import { Product } from '../entities/product.entity';
import { firstValueFrom } from 'rxjs';
import { GraphQLError } from 'graphql';
import { Comment } from '../entities/comment.entity';
import { AppService } from '../app.service';

const PRODUCT_CREATED_EVENT = 'productCreated';
const CREATE_COMMENT_PRODUCT_EVENT = 'createCommentProduct';

@Resolver('product')
export class ProductResolver {
  constructor(
    @Inject('AUTH_SERVICE')
    private readonly authService: ClientProxy,

    @Inject('PRODUCT_SERVICE')
    private readonly productService: ClientProxy,

    @Inject(PUB_SUB) private pubSub: RedisPubSub,

    private readonly appService: AppService,
  ) {}

  // @Subscription(() => GetProductResponse)
  @Subscription(() => Product)
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('user')
  productCreated() {
    return this.pubSub.asyncIterator(PRODUCT_CREATED_EVENT);
  }
  @Query(() => GetProductsResponse)
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('user')
  async getProducts(@Args('getProductsDto') getProducts: GetProductsDto) {
    return this.productService.send(
      {
        cmd: 'get-products',
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
  @Query(() => GetProductResponse)
  async getProduct(@Args('getProductDto') getProduct: GetProductDto) {
    return this.productService.send(
      {
        cmd: 'get-product',
      },
      {
        productId: getProduct.id,
      },
    );
  }

  @Mutation(() => CreateProductsResponse)
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('admin')
  async createProduct(
    @Args('createProductInput') createProduct: CreateProductInput,
    @Context() context,
  ) {
    const { req, res } = context;
    if (!req?.user) {
      throw new BadRequestException();
    }
    const data = await firstValueFrom<CreateProductsResponse>(
      this.productService.send(
        {
          cmd: 'create-product',
        },
        {
          ...createProduct,
          userId: req.user.id,
        },
      ),
    );
    if (data.product) {
      this.pubSub.publish(PRODUCT_CREATED_EVENT, {
        productCreated: {
          ...data.product,
        },
      });
    }

    return data;
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
          return await this.appService.handleImageUpload(image);
        }),
      )
    ).filter((item) => item !== null);
    // console.log(imageBase64Strings.length);
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
  // async convertStreamToBase64(stream: Readable): Promise<string> {
  //   return new Promise((resolve, reject) => {
  //     const chunks: Buffer[] = [];
  //     stream.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
  //     stream.on('end', () => resolve(Buffer.concat(chunks).toString('base64')));
  //     stream.on('error', reject);
  //   });
  // }

  // async handleImageUpload(image: GraphQLUpload) {
  //   const { createReadStream } = await image;
  //   const base64String = await this.convertStreamToBase64(createReadStream());
  //   return base64String;
  // }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles('user')
  @Mutation(() => AddCommentProductResponse)
  async addCommentProduct(
    @Args('addCommentProductInput')
    addCommentProductInput: AddCommentProductInput,
    @Context() context,
  ) {
    const { req, res } = context;
    if (!req?.user) {
      throw new BadRequestException();
    }

    try {
      const data = await firstValueFrom<AddCommentProductResponse>(
        this.productService.send(
          {
            cmd: 'add-comment-product',
          },
          {
            ...addCommentProductInput,
            userId: req.user.id,
          },
        ),
      );

      if (data.comment) {
        this.pubSub.publish(CREATE_COMMENT_PRODUCT_EVENT, {
          createCommentProduct: {
            ...data.comment,
          },
        });
      }
      return data;
    } catch (error) {
      throw new GraphQLError(error.message, {
        extensions: { ...error },
      });
    }
  }
  @Subscription(() => Comment, {
    filter: (payload, variables) => {
      return payload.createCommentProduct.product.id == variables.productId;
    },
    resolve: (payload) => {
      return payload.createCommentProduct; // fonk ismi ile farklı olduğunda addCommentProductSubscription   event değişkenini resolver olarak return ederiz
    },
  })
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('user')
  createCommentProduct(@Args('productId') productId: number) {
    return this.pubSub.asyncIterator(CREATE_COMMENT_PRODUCT_EVENT);
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles('user')
  @Query(() => GetCommentsResponse)
  async getComments(
    @Args('getCommentsInput') getCommentsInput: GetCommentsInput,
    @Context() context,
  ) {
    const { req, res } = context;
    if (!req?.user) {
      throw new BadRequestException();
    }
    return this.productService.send(
      {
        cmd: 'get-comments',
      },
      {
        ...getCommentsInput,
        // userId: req.user.id,
      },
    );
  }
}
