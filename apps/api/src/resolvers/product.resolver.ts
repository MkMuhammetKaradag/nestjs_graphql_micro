import { Args, Context, Mutation, Resolver } from '@nestjs/graphql';

import { ClientProxy } from '@nestjs/microservices';

import { AuthGuard, PUB_SUB, Roles, RolesGuard } from '@app/shared';

import { RedisPubSub } from 'graphql-redis-subscriptions';
import { BadRequestException, Inject, UseGuards } from '@nestjs/common';
import { CreateProductsResponse } from '../InputTypes/product.object';
import { CreateProductDto } from '../InputTypes/product.Input';

@Resolver('product')
export class ProductResolver {
  constructor(
    @Inject('AUTH_SERVICE')
    private readonly authService: ClientProxy,

    @Inject('PRODUCT_SERVICE')
    private readonly productService: ClientProxy,

    @Inject(PUB_SUB) private pubSub: RedisPubSub,
  ) {}

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
}
