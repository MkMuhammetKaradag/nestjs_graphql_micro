import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';
import { User } from './entities/user.entity';
import { HttpException, HttpStatus, Inject, UseGuards } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { UserLoginInput, UserRegisterInput } from './InputTypes/user-Input';
import { AuthGuard, UserEntity } from '@app/shared';
import { UserLoginResponse } from './InputTypes/user-object';
import { Request, Response } from 'express';
import { catchError, of, switchMap } from 'rxjs';

@Resolver('app')
export class AppResolver {
  constructor(
    @Inject('AUTH_SERVICE')
    private readonly authService: ClientProxy,
  ) {}
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
