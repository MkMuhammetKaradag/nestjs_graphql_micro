import { ProductRepositoryInterface } from '@app/shared/interfaces/product-repository.interface';
import {
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateProductDTO } from './dtos/create-product.dto';
import { CloudinaryService, UserRepositoryInterface } from '@app/shared';
import { Like } from 'typeorm';
import { UploadProductImagesDTO } from './dtos/upload-product-images.dto';
import * as GraphQLUpload from 'graphql-upload/GraphQLUpload.js';
import { GetMyProductsDTO } from './dtos/get-myProducts.dto';
@Injectable()
export class ProductService {
  constructor(
    @Inject('ProductsRepositoryInterface')
    private readonly productRepository: ProductRepositoryInterface,
    @Inject('UsersRepositoryInterface')
    private readonly userRepository: UserRepositoryInterface,
    private cloudinary: CloudinaryService,
  ) {}

  getHello(): string {
    return 'Hello World!';
  }
  async getProduct(paginationOptions: {
    take: number;
    skip: number;
    keyword: string;
  }) {
    const take = paginationOptions.take || 10;
    const skip = paginationOptions.skip || 0;
    const keyword = paginationOptions.keyword || '';
    const [products, total] = await this.productRepository.pagination({
      where: { name: Like('%' + keyword + '%') },
      order: { name: 'DESC' },
      take: take,
      skip: skip,
    });

    return { products, total };
  }

  async getMyProducts(paginationOptions: GetMyProductsDTO) {
    const take = paginationOptions.take || 10;
    const skip = paginationOptions.skip || 0;
    const keyword = paginationOptions.keyword || '';
    const [products, total] = await this.productRepository.pagination({
      where: {
        name: Like('%' + keyword + '%'),
        vendor: { id: paginationOptions.userId },
      },
      relations: ['vendor'],
      order: { name: 'DESC' },
      take: take,
      skip: skip,
    });

    return { products, total };
  }

  async createProduct(createProductDto: CreateProductDTO) {
    const { description, name, price, quantity, userId } = createProductDto;
    const vendor = await this.userRepository.findOneById(userId);
    const product = await this.productRepository.save({
      description,
      name,
      price,
      quantity,
      vendor,
    });
    return { product };
  }

  async storeImageAndGetUrl(file: string) {
    return (await this.cloudinary.uploadImage(file)).url;
  }
  async uploadProductImages(uploadProductImages: UploadProductImagesDTO) {
    const { images, productId, userId } = uploadProductImages;

    const product = await this.productRepository.findByCondition({
      where: { id: productId },
      relations: ['vendor'],
    });
    const user = await this.userRepository.findOneById(userId);
    if (!product || !user) {
      throw new NotFoundException('user or product not found ');
    }

    if (product.vendor.id !== user.id) {
      throw new UnauthorizedException('you are not the owner of this product ');
    }

    const imagesUrls = await Promise.all(
      images.map(async (image) => {
        const imageUrl = await this.storeImageAndGetUrl(image);
        return imageUrl;
      }),
    );
    product.images = imagesUrls;
    await this.productRepository.save(product);
    return { product };
  }
}
