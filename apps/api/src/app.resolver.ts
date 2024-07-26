import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';
import { User } from './entities/user.entity';
import {
  HttpException,
  HttpStatus,
  Inject,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { UserLoginInput, UserRegisterInput } from './InputTypes/user-Input';
import { AuthGuard, Roles, RolesGuard, UserEntity } from '@app/shared';
import { UserLoginResponse } from './InputTypes/user-object';
import { Request, Response } from 'express';
import { catchError, of, switchMap } from 'rxjs';
import { UserInterceptor } from '@app/shared/interceptors/user.interceptor';

@Resolver('app')
export class AppResolver {
  constructor(
    @Inject('AUTH_SERVICE')
    private readonly authService: ClientProxy,
  ) {}

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

  @Mutation(() => User)
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
}
