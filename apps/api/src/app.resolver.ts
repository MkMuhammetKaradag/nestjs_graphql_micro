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
  HttpException,
  HttpStatus,
  Inject,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import {
  ActivationDto,
  ForgotPasswordDto,
  ResetPasswordDto,
  UserLoginInput,
  UserRegisterInput,
} from './InputTypes/user-Input';
import { AuthGuard, PUB_SUB, Roles, RolesGuard, UserEntity } from '@app/shared';
import {
  ActivationResponse,
  ForgotPasswordResponse,
  RegisterResponse,
  ResetPasswordResponse,
  UserLoginResponse,
} from './InputTypes/user-object';
import { Request, Response } from 'express';
import { catchError, of, switchMap } from 'rxjs';
import { UserInterceptor } from '@app/shared/interceptors/user.interceptor';
import { RedisPubSub } from 'graphql-redis-subscriptions';
const USER_ADDED_EVENT = 'userAdded';
@Resolver('app')
export class AppResolver {
  constructor(
    @Inject('AUTH_SERVICE')
    private readonly authService: ClientProxy,

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
  async login(
    @Args('userLoginData') userlogin: UserLoginInput,
    @Context() context,
  ) {
    const { req, res } = context;
    res.cookie('token', 'testmami');
    return this.authService
      .send(
        {
          cmd: 'login',
        },
        {
          ...userlogin,
        },
      )
      .pipe(
        switchMap((loginUserResponse: UserLoginResponse) => {
          if (loginUserResponse.token) {
            res.cookie('token', loginUserResponse.token);
          }
          return of(loginUserResponse);
        }),
        catchError(() => {
          throw new HttpException(
            'User already exists',
            HttpStatus.BAD_REQUEST,
          );
        }),
      );
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
}
