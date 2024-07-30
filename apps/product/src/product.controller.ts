import { Controller, Get, Inject } from '@nestjs/common';
import { ProductService } from './product.service';
import { Ctx, MessagePattern, Payload, RmqContext } from '@nestjs/microservices';
import { SharedService } from '@app/shared';
import { CreateProductDTO } from './dtos/create-product.dto';

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
  async getProduct(@Ctx() context: RmqContext) {
    this.sharedService.acknowledgeMessage(context);
    return this.productService.getProduct();
  }

  @MessagePattern({cmd:"create-product"})
  async createProduct(@Ctx() context:RmqContext,@Payload() createUser:CreateProductDTO ){
    return await this.productService.createProduct(createUser)
  }
}
