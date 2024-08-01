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
  ActivationDto,
  ForgotPasswordDto,
  ResetPasswordDto,
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
  UserLoginResponse,
} from './InputTypes/user-object';
import { Request, Response } from 'express';
import { catchError, firstValueFrom, of, switchMap, throwError } from 'rxjs';
import { UserInterceptor } from '@app/shared/interceptors/user.interceptor';
import { RedisPubSub } from 'graphql-redis-subscriptions';
import { ApolloServer } from 'apollo-server-express';
import { GraphQLError } from 'graphql';

const USER_ADDED_EVENT = 'userAdded';
@Resolver('app')
export class AppResolver {
  constructor(
    @Inject('AUTH_SERVICE')
    private readonly authService: ClientProxy,
    @Inject('PRODUCT_SERVICE')
    private readonly productService: ClientProxy,

    @Inject(PUB_SUB) private pubSub: RedisPubSub,
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
  async register(@Args('userRegisterData') userRegister: UserRegisterInput) {
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
    @Args('activationInput') activationDto: ActivationDto,
    @Context() context: { res: Response },
  ) {
    return this.authService
      .send(
        {
          cmd: 'activate_user',
        },
        {
          ...activationDto,
        },
      )
      .pipe(
        switchMap((data) => {
          this.pubSub.publish(USER_ADDED_EVENT, {
            userAdded: {
              ...data.user,
            },
          });
          console.log('pip user', data.user);
          return of(data);
        }),
        catchError(() => {
          throw new HttpException(
            'User already exists',
            HttpStatus.BAD_REQUEST,
          );
        }),
      );
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

      // .pipe(
      //   switchMap((loginUserResponse: UserLoginResponse) => {
      if (data.token) {
        res.cookie('token', data.token);
      }

      return data;
    } catch (error) {
      console.log(error);
      throw new GraphQLError(error.message, {
        extensions: { ...error },
      });
    }
  }

  @Mutation(() => ForgotPasswordResponse)
  async forgotPassword(
    @Args('forgotPasswordInput') forgotPasswordDto: ForgotPasswordDto,
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
    @Args('resetPasswordInput') resetPasswordDto: ResetPasswordDto,
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

  // Auth End
}
