import {
  Args,
  Context,
  Mutation,
  Query,
  Resolver,
  Subscription,
} from '@nestjs/graphql';
import { User } from './entities/user.entity';
import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Inject,
  NotFoundException,
  UnauthorizedException,
  UseFilters,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import {
  ActivationInput,
  ForgotPasswordInput,
  ResetPasswordInput,
  SetUserOnlineStatusInput,
  UserLoginInput,
  UserRegisterInput,
} from './InputTypes/user-Input';
import {
  AllRpcExceptionsFilter,
  AuthGuard,
  PUB_SUB,
  Roles,
  RolesGuard,
  UserEntity,
} from '@app/shared';
import {
  ActivationResponse,
  ForgotPasswordResponse,
  GetProductsResponse,
  RegisterResponse,
  ResetPasswordResponse,
  UploadProfilePhotoResponse,
  UserLoginResponse,
} from './InputTypes/user-object';
import { Request, Response } from 'express';
import { catchError, firstValueFrom, of, switchMap, throwError } from 'rxjs';
import { UserInterceptor } from '@app/shared/interceptors/user.interceptor';
import { RedisPubSub } from 'graphql-redis-subscriptions';
import { ApolloError, ApolloServer } from 'apollo-server-express';
import { GraphQLError } from 'graphql';
import * as GraphQLUpload from 'graphql-upload/GraphQLUpload.js';
import { AppService } from './app.service';
const USER_ADDED_EVENT = 'userAdded';
const USER_STATUS_CHANGED = 'userStatusChanged';
@Resolver('app')
export class AppResolver {
  constructor(
    @Inject('AUTH_SERVICE')
    private readonly authService: ClientProxy,
    @Inject('PRODUCT_SERVICE')
    private readonly productService: ClientProxy,

    @Inject(PUB_SUB) private pubSub: RedisPubSub,

    private readonly appService: AppService,
  ) {}

  @Subscription(() => User)
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('user')
  userAdded() {
    return this.pubSub.asyncIterator(USER_ADDED_EVENT);
  }

  @Query(() => String)
  // @UseInterceptors(UserInterceptor) // auth guardı manipüle yapar   Interceptor'lar, bir istek işlenmeden önce intercept metodunu çağırır ve isteğin işlenmesini durdurabilir veya değiştirebilir. next.handle() çağrıldığında istek işlenmeye devam eder ve yanıt dönmeden önce tekrar bir işlem yapılabilir.
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('admin')
  getAdminData(@Context() context) {
    console.log('admin içi', context?.req?.user);
    return 'Admin Data';
  }

  @Query(() => String)
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('user')
  getUserData(@Context() context) {
    return 'User Data';
  }

  @Query(() => [User])
  @UseGuards(AuthGuard)
  async getUsers() {
    console.log('hello api');
    return this.authService.send(
      {
        cmd: 'get_users',
      },
      {},
    );
  }
  @Query(() => User)
  @UseGuards(AuthGuard)
  async getMe(@Context() context) {
    const { req, res } = context;
    if (!req?.user) {
      throw new UnauthorizedException('Unauthorized');
    }
    return this.authService.send(
      {
        cmd: 'get-me',
      },
      {
        userId: req.user.id,
      },
    );
  }

  @Mutation(() => RegisterResponse)
  async register(@Args('userRegisterInput') userRegister: UserRegisterInput) {
    return this.authService.send(
      {
        cmd: 'register',
      },
      {
        ...userRegister,
      },
    );
  }

  @Mutation(() => ActivationResponse)
  async activateUser(
    @Args('activationInput') activationDto: ActivationInput,
    @Context() context: { res: Response },
  ) {
    try {
      const data = await firstValueFrom<ActivationResponse>(
        this.authService.send(
          {
            cmd: 'activate_user',
          },
          {
            ...activationDto,
          },
        ),
      );
      if (data.user) {
        this.pubSub.publish(USER_ADDED_EVENT, {
          userAdded: {
            ...data.user,
          },
        });
      }
      return data;
    } catch (error) {
      console.log(error);
      throw new GraphQLError(error.message, {
        extensions: { ...error },
      });
    }

    // .pipe(
    //   switchMap((data) => {
    //     this.pubSub.publish(USER_ADDED_EVENT, {
    //       userAdded: {
    //         ...data.user,
    //       },
    //     });
    //     console.log('pip user', data.user);
    //     return of(data);
    //   }),
    //   catchError(() => {
    //     throw new HttpException(
    //       'User already exists',
    //       HttpStatus.BAD_REQUEST,
    //     );
    //   }),
    // );
  }

  @Mutation(() => UserLoginResponse)
  // @UseFilters(AllRpcExceptionsFilter)
  async login(
    @Args('loginInput') userlogin: UserLoginInput,
    @Context() context,
  ): Promise<UserLoginResponse> {
    const { req, res } = context;
    res.cookie('token', 'testmami');
    try {
      const data = await firstValueFrom<UserLoginResponse>(
        this.authService.send(
          {
            cmd: 'login',
          },
          {
            ...userlogin,
          },
        ),
      );
      if (data.token) {
        res.cookie('mk_session', data.token);
      }

      return data;
    } catch (error) {
      console.log(error);
      throw new GraphQLError(error.message, {
        extensions: { ...error },
      });
    }
  }

  @Mutation(() => String)
  async logout(@Context() context: { res: Response }) {
    const { res } = context;
    try {
      res.clearCookie('mk_session', {
        path: '/', // Çerezin path ayarı
        httpOnly: true, // Çerezin httpOnly ayarı (varsa)
        secure: true, // Çerezin secure ayarı (eğer HTTPS üzerinde çalışıyorsanız)
        sameSite: 'strict', // Çerezin sameSite ayarı
      });
      return 'successfully logged out ';
    } catch (error) {
      throw new Error(`Logout failed: ${error.message}`);
    }
  }

  @Mutation(() => ForgotPasswordResponse)
  async forgotPassword(
    @Args('forgotPasswordInput') forgotPasswordDto: ForgotPasswordInput,
  ) {
    return this.authService.send(
      {
        cmd: 'forgot-password',
      },
      {
        email: forgotPasswordDto.email,
      },
    );
  }

  @Mutation(() => ResetPasswordResponse)
  async resetPassword(
    @Args('resetPasswordInput') resetPasswordDto: ResetPasswordInput,
  ) {
    return this.authService.send(
      {
        cmd: 'reset-password',
      },
      {
        ...resetPasswordDto,
      },
    );
  }
  @Mutation(() => UploadProfilePhotoResponse)
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('user')
  async profilPhotoUpload(
    @Args({
      name: 'image',
      type: () => GraphQLUpload,
    })
    image: GraphQLUpload,
    @Context() context,
  ) {
    const { req, res } = context;
    if (!req?.user) {
      throw new ApolloError('user is required', 'USER_REQUIRED');
    }
    if (!image) throw new ApolloError('Image is required', 'IMAGE_REQUIRED');
    const allowedTypes = ['image/jpeg', 'image/png'];
    const { mimetype } = await image;

    let imageBase64String = null;

    if (allowedTypes.includes(mimetype)) {
      imageBase64String = await this.appService.handleImageUpload(image);
    }
    // console.log(imageBase64Strings.length);
    return this.authService.send(
      {
        cmd: 'upload-profilePhoto',
      },
      {
        image: imageBase64String,
        userId: req.user.id,
      },
    );
  }

  @Mutation(() => UserEntity)
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('user')
  async setUserOnlineStatus(
    @Args('setUserOnlineStatusInput')
    setUserOnlineStatusInput: SetUserOnlineStatusInput,
    @Context() context,
  ): Promise<UserEntity> {
    const { res, req } = context;
    if (!req?.user?.id) {
      throw new ApolloError('user is required', 'USER_REQUIRED');
    }
    try {
      const user = await firstValueFrom<UserEntity>(
        this.authService.send(
          {
            cmd: 'set-userOnline-status',
          },
          {
            isOnline: setUserOnlineStatusInput.isOnline,
            userId: req.user.id,
          },
        ),
      );
      if (user) {
        this.pubSub.publish(USER_STATUS_CHANGED, { userStatusChanged: user });
      }
      return user;
    } catch (error) {
      throw new GraphQLError(error.message, {
        extensions: { ...error },
      });
    }
  }

  @Subscription(() => UserEntity, {
    filter: (payload, variables) =>
      payload.userStatusChanged.id === variables.userId,
  })
  userStatusChanged(@Args('userId') userId: number) {
    return this.pubSub.asyncIterator(USER_STATUS_CHANGED);
  }
  // Auth End
}
