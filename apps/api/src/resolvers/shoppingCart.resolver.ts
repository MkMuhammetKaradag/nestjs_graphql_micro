import { AuthGuard, Roles, RolesGuard } from '@app/shared';
import { BadRequestException, Inject, UseGuards } from '@nestjs/common';
import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { ShoppingCart } from '../entities/shoppingCart.entity';
import {
  AddSoppingCartResponse,
  GetSoppingCartResponse,
} from '../InputTypes/shoppingCart.Object';
import {
  AddShoppingCartProductInput,
  GetShoppingCartInput,
} from '../InputTypes/shoppingCart.Input';
import { GraphQLError } from 'graphql';

Resolver('shoppingCart');
export class ShoppingCartResolver {
  constructor(
    @Inject('PRODUCT_SERVICE')
    private readonly productService: ClientProxy,
  ) {}

  @Query(() => GetSoppingCartResponse)
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('user')
  async getMyShoppingCart(@Context() context) {
    const { req, res } = context;
    const data = await firstValueFrom<GetSoppingCartResponse>(
      this.productService.send(
        {
          cmd: 'get-shoppingCart',
        },
        {
          userId: req.user.id,
        },
      ),
    );

    return data;
  }

  @Mutation(() => AddSoppingCartResponse)
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('user')
  async addShoppingCartProduct(
    @Args('addShoppingCartProductInput')
    addShoppingCartProductInput: AddShoppingCartProductInput,
    @Context() context,
  ) {
    const { req, res } = context;
    if (!req?.user) {
      throw new BadRequestException();
    }
    try {
      const data = await firstValueFrom(
        this.productService.send(
          {
            cmd: 'add-shoppingCart-product',
          },
          {
            userId: req.user.id,
            productId: addShoppingCartProductInput.productId,
          },
        ),
      );

      return data;
    } catch (error) {
      throw new GraphQLError(error.message, {
        extensions: { ...error },
      });
    }
  }

  @Mutation(() => GetSoppingCartResponse)
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('user')
  async removeShoppingCartItemProduct(
    @Args('removeShoppingCartProductInput')
    removeShoppingCartProductInput: AddShoppingCartProductInput,
    @Context() context,
  ) {
    const { req, res } = context;
    if (!req?.user) {
      throw new BadRequestException();
    }

    const data = await firstValueFrom(
      this.productService.send(
        {
          cmd: 'remove-shoppingCartItem-product',
        },
        {
          userId: req.user.id,
          productId: removeShoppingCartProductInput.productId,
        },
      ),
    );

    return data;
  }

  @Mutation(() => GetSoppingCartResponse)
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('user')
  async removeShoppingCartItem(
    @Args('removeShoppingCartItemInput')
    removeShoppingCartItemInput: AddShoppingCartProductInput,
    @Context() context,
  ) {
    const { req, res } = context;
    if (!req?.user) {
      throw new BadRequestException();
    }

    try {
      const data = await firstValueFrom(
        this.productService.send(
          {
            cmd: 'remove-shoppingCart-item',
          },
          {
            userId: req.user.id,
            productId: removeShoppingCartItemInput.productId,
          },
        ),
      );

      return data;
    } catch (error) {
      throw new GraphQLError(error.message, {
        extensions: { ...error },
      });
    }
  }
}
