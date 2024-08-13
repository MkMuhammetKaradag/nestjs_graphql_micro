import { Controller, Get, Inject } from '@nestjs/common';
import { ProductService } from './product.service';
import {
  Ctx,
  MessagePattern,
  Payload,
  RmqContext,
} from '@nestjs/microservices';
import { SharedService } from '@app/shared';
import { CreateProductDTO } from './dtos/create-product.dto';
import { GetProductsDTO } from './dtos/get-products.dto';
import { UploadProductImagesDTO } from './dtos/upload-product-images.dto';
import { GetMyProductsDTO } from './dtos/get-myProducts.dto';
import { AddCommentProductInput } from './dtos/add-commentProduct.dto';
import { GetCommentsDTO } from './dtos/get-comments.dto';

@Controller()
export class ProductController {
  constructor(
    @Inject('producServiceInterface')
    private readonly productService: ProductService,
    @Inject('SharedServiceInterface')
    private readonly sharedService: SharedService,
  ) {}

  @Get()
  getHello(): string {
    return this.productService.getHello();
  }
  @MessagePattern({ cmd: 'get-products' })
  async getProducts(
    @Ctx() context: RmqContext,
    @Payload() getProducts: GetProductsDTO,
  ) {
    this.sharedService.acknowledgeMessage(context);
    return this.productService.getProducts(getProducts);
  }

  @MessagePattern({ cmd: 'get-product' })
  async getProduct(
    @Ctx() context: RmqContext,
    @Payload() getProduct: { productId: number },
  ) {
    this.sharedService.acknowledgeMessage(context);
    return this.productService.getProduct(getProduct.productId);
  }
  @MessagePattern({ cmd: 'get-myProducts' })
  async getMyProducts(
    @Ctx() context: RmqContext,
    @Payload() getProducts: GetMyProductsDTO,
  ) {
    this.sharedService.acknowledgeMessage(context);
    return this.productService.getMyProducts(getProducts);
  }

  @MessagePattern({ cmd: 'create-product' })
  async createProduct(
    @Ctx() context: RmqContext,
    @Payload() createProduct: CreateProductDTO,
  ) {
    this.sharedService.acknowledgeMessage(context);
    return await this.productService.createProduct(createProduct);
  }

  @MessagePattern({
    cmd: 'upload-product-images',
  })
  async uploadProductImages(
    @Ctx() context: RmqContext,
    @Payload() uploadProductImages: UploadProductImagesDTO,
  ) {
    this.sharedService.acknowledgeMessage(context);
    return await this.productService.uploadProductImages(uploadProductImages);
  }

  @MessagePattern({
    cmd: 'add-comment-product',
  })
  async addCommentProduct(
    @Ctx() context: RmqContext,
    @Payload() addCommentProductInput: AddCommentProductInput,
  ) {
    this.sharedService.acknowledgeMessage(context);
    return await this.productService.addCommentProduct(addCommentProductInput);
  }

  @MessagePattern({
    cmd: 'get-comments-product',
  })
  async getCommentsProduct(
    @Ctx() context: RmqContext,
    @Payload() productId: number,
  ) {
    this.sharedService.acknowledgeMessage(context);
    return await this.productService.getCommentsProduct(productId);
  }

  @MessagePattern({ cmd: 'get-comments' })
  async getComments(
    @Ctx() context: RmqContext,
    @Payload() getComments: GetCommentsDTO,
  ) {
    this.sharedService.acknowledgeMessage(context);
    return this.productService.getComments(getComments);
  }

  @MessagePattern({
    cmd: 'get-shoppingCart',
  })
  async GetShoppingCartInput(
    @Ctx() context: RmqContext,
    @Payload()
    getShoppingCart: {
      userId: number;
    },
  ) {
    this.sharedService.acknowledgeMessage(context);
    return await this.productService.getShoppingCart(getShoppingCart.userId);
  }

  @MessagePattern({
    cmd: 'add-shoppingCart-product',
  })
  async AddShoppingCartProduct(
    @Ctx() context: RmqContext,
    @Payload()
    addShoppingCartProduct: {
      productId: number;
      userId: number;
    },
  ) {
    this.sharedService.acknowledgeMessage(context);
    return await this.productService.addShoppingCartProduct(
      addShoppingCartProduct,
    );
  }

  @MessagePattern({
    cmd: 'remove-shoppingCartItem-product',
  })
  async removeShoppingCartItemProduct(
    @Ctx() context: RmqContext,
    @Payload()
    removeShoppingCartProduct: {
      productId: number;
      userId: number;
    },
  ) {
    this.sharedService.acknowledgeMessage(context);
    return await this.productService.removeShoppingCartItemProduct(
      removeShoppingCartProduct,
    );
  }
  @MessagePattern({
    cmd: 'remove-shoppingCart-item',
  })
  async removeShoppingCartItem(
    @Ctx() context: RmqContext,
    @Payload()
    removeShoppingCartItem: {
      productId: number;
      userId: number;
    },
  ) {
    this.sharedService.acknowledgeMessage(context);
    return await this.productService.removeShoppingCartItem(
      removeShoppingCartItem,
    );
  }
}
