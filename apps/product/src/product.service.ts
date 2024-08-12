import { ProductRepositoryInterface } from '@app/shared/interfaces/product-repository.interface';
import {
  BadRequestException,
  HttpStatus,
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateProductDTO } from './dtos/create-product.dto';
import {
  CloudinaryService,
  CommentRepositoryInterface,
  ShoppingCartEntity,
  ShoppingCartItemEntity,
  ShoppingCartRepositoryInterface,
  UserRepositoryInterface,
} from '@app/shared';
import { Like } from 'typeorm';
import { UploadProductImagesDTO } from './dtos/upload-product-images.dto';
import * as GraphQLUpload from 'graphql-upload/GraphQLUpload.js';
import { GetMyProductsDTO } from './dtos/get-myProducts.dto';
import { AddCommentProductInput } from './dtos/add-commentProduct.dto';
import { RpcException } from '@nestjs/microservices';
import { GetCommentsDTO } from './dtos/get-comments.dto';
import { plainToClass } from 'class-transformer';
@Injectable()
export class ProductService {
  constructor(
    @Inject('ProductsRepositoryInterface')
    private readonly productRepository: ProductRepositoryInterface,

    @Inject('CommentsRepositoryInterface')
    private readonly commentRepository: CommentRepositoryInterface,
    @Inject('UsersRepositoryInterface')
    private readonly userRepository: UserRepositoryInterface,

    @Inject('ShoppingCartsRepositoryInterface')
    private readonly shoppingCartRepository: ShoppingCartRepositoryInterface,
    private cloudinary: CloudinaryService,
  ) {}

  getHello(): string {
    return 'Hello World!';
  }
  async getProducts(paginationOptions: {
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

  async getProduct(productId: number) {
    const product = await this.productRepository.findByCondition({
      where: { id: productId },
      select: {
        vendor: { id: true, firstName: true, lastName: true, email: true }, // Sadece userId alanının id ve name alanlarını çek
      },
      relations: ['vendor', 'comments', 'comments.user'],
    });
    return { product };
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

  async addCommentProduct(addCommentProductInput: AddCommentProductInput) {
    const { productId, comment, userId } = addCommentProductInput;
    const product = await this.productRepository.findOneById(productId);
    const user = await this.userRepository.findOneById(userId);
    if (!product || !user) {
      throw new RpcException({
        message: 'product or user not found',
        statusCode: HttpStatus.NOT_FOUND,
      });
    }
    try {
      const data = await this.commentRepository.save({
        text: comment,
        user,
        product,
      });

      return { comment: data };
    } catch (error) {
      throw new RpcException({
        message: error.message,
        statusCode: HttpStatus.CREATED,
      });
    }
  }

  async getCommentsProduct(productId: number) {
    // const product = await this.productRepository.findByCondition({
    //   where: { id: productId },
    //   select: {
    //     vendor: { id: true, firstName: true, lastName: true, email: true }, // Sadece userId alanının id ve name alanlarını çek
    //   },
    //   relations: ['vendor', 'comments', 'comments.user'],
    // });
    return { comments: ['mami tarafından çekildi'] };
  }

  async getComments(getComments: GetCommentsDTO) {
    const take = getComments.take || 10;
    const skip = getComments.skip || 0;

    const [comments, total] = await this.commentRepository.pagination({
      where: {
        product: { id: getComments.productId },
      },
      relations: ['product', 'user'],
      order: { createdAt: 'DESC' },
      take: take,
      skip: skip,
    });

    return { comments, total };
  }

  async getShoppingCart(userId: number) {
    const userWithCart = await this.userRepository.findByCondition({
      where: { id: userId },
      relations: [
        'shoppingCart',
        'shoppingCart.items',
        'shoppingCart.items.product',
      ],
    });

    return {
      shoppingCart: userWithCart.shoppingCart,
    };
  }

  async addShoppingCartProduct(addShoppingCartProduct: {
    productId: number;
    userId: number;
  }) {
    const { userId, productId } = addShoppingCartProduct;
    const userWithCart = await this.userRepository.findByCondition({
      where: { id: userId },
      relations: [
        'shoppingCart',
        'shoppingCart.items',
        'shoppingCart.items.product',
      ],
    });
    // Eğer kullanıcının sepeti yoksa, yeni bir sepet oluşturun
    if (!userWithCart.shoppingCart) {
      const newCart = new ShoppingCartEntity();
      newCart.user = userWithCart;
      userWithCart.shoppingCart =
        await this.shoppingCartRepository.save(newCart);
    }
    if (!userWithCart.shoppingCart.items) {
      userWithCart.shoppingCart.items = [];
    }
    const product = await this.productRepository.findOneById(productId);

    // Sepette bu ürünün olup olmadığını kontrol et
    const existingItem = userWithCart.shoppingCart.items.find(
      (item) => item.product.id === productId,
    );

    if (existingItem) {
      // Ürün zaten sepetin içindeyse, miktarını artır
      existingItem.quantity += 1;
    } else {
      // Ürün sepette yoksa, yeni bir item ekle
      const newItem = new ShoppingCartItemEntity();
      newItem.product = product;
      newItem.cart = userWithCart.shoppingCart;
      newItem.quantity = 1;
      userWithCart.shoppingCart.items.push(newItem);
    }

    // function replacer(key: string, value: any) {
    //   const seen = new WeakSet();
    //   return function (key: string, value: any) {
    //     if (typeof value === 'object' && value !== null) {
    //       if (seen.has(value)) {
    //         return; // Döngüsel referansı atla
    //       }
    //       seen.add(value);
    //     }
    //     return value;
    //   };
    // }
    await this.shoppingCartRepository.save(userWithCart.shoppingCart);
    // const jsonString = JSON.stringify(myShoppingCart, replacer('key', 'value'));
    // console.log(jsonString);
    return {
      product: product,
    };
  }

  async removeShoppingCartItemProduct(removeShoppingCartProduct: {
    productId: number;
    userId: number;
  }) {
    const { userId, productId } = removeShoppingCartProduct;
    // Kullanıcının sepetini ve ürünleri ilişkilendirilmiş olarak yükleyin
    let userWithCart = await this.userRepository.findByCondition({
      where: { id: userId },
      relations: [
        'shoppingCart',
        'shoppingCart.items',
        'shoppingCart.items.product',
      ],
    });

    // Eğer kullanıcının sepeti yoksa, işlem yapmaya gerek yok
    if (!userWithCart.shoppingCart) {
      throw new Error('Sepet bulunamadı');
    }

    // Sepetteki ürünlerin listesini kontrol et
    const cartItems = userWithCart.shoppingCart.items;

    // Ürün bulunup bulunmadığını kontrol et
    const existingItem = cartItems.find(
      (item) => item.product.id === productId,
    );

    if (existingItem) {
      // Ürün sepette bulunuyor, miktarını azalt
      if (existingItem.quantity > 1) {
        existingItem.quantity -= 1;
      } else {
        // Miktar 1 ise, ürünü sepetten tamamen kaldır
        userWithCart.shoppingCart.items = cartItems.filter(
          (item) => item.product.id !== productId,
        );
      }

      // Sepeti güncelle
      await this.shoppingCartRepository.save(userWithCart.shoppingCart);

      return {
        shoppingCart: userWithCart.shoppingCart,
      };
    } else {
      throw new Error('Ürün sepet içinde bulunamadı');
    }
  }

  async removeShoppingCartItem(removeShoppingCartProduct: {
    productId: number;
    userId: number;
  }) {
    const { userId, productId } = removeShoppingCartProduct;
    // Kullanıcının sepetini ve ürünleri ilişkilendirilmiş olarak yükleyin
    let userWithCart = await this.userRepository.findByCondition({
      where: { id: userId },
      relations: [
        'shoppingCart',
        'shoppingCart.items',
        'shoppingCart.items.product',
      ],
    });

    // Eğer kullanıcının sepeti yoksa, işlem yapmaya gerek yok
    if (!userWithCart.shoppingCart) {
      throw new Error('Sepet bulunamadı');
    }

    // Sepetteki ürünlerin listesini kontrol et
    const cartItems = userWithCart.shoppingCart.items;

    // Ürün bulunup bulunmadığını kontrol et
    const updatedItems = cartItems.filter(
      (item) => item.product.id !== productId,
    );

    if (cartItems.length === updatedItems.length) {
      // Eğer ürün sepet içinde bulunamadıysa
      throw new Error('Ürün sepet içinde bulunamadı');
    }

    // Ürünü sepetten kaldır
    userWithCart.shoppingCart.items = updatedItems;

    // Sepeti güncelle
    await this.shoppingCartRepository.save(userWithCart.shoppingCart);
  }
}
