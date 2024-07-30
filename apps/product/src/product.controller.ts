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
  @MessagePattern({ cmd: 'get-product' })
  async getProduct(
    @Ctx() context: RmqContext,
    @Payload() getProducts: GetProductsDTO,
  ) {
    this.sharedService.acknowledgeMessage(context);
    return this.productService.getProduct(getProducts);
  }

  @MessagePattern({ cmd: 'create-product' })
  async createProduct(
    @Ctx() context: RmqContext,
    @Payload() createProduct: CreateProductDTO,
  ) {
    this.sharedService.acknowledgeMessage(context);
    return await this.productService.createProduct(createProduct);
  }
}
