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
}
