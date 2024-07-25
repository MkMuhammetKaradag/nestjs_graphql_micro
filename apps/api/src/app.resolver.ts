import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';
import { User } from './entities/user.entity';
import { Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { UserRegisterInput } from './InputTypes/user-Input';

@Resolver('app')
export class AppResolver {
  constructor(
    @Inject('AUTH_SERVICE')
    private readonly authService: ClientProxy,
  ) {}
  @Query(() => [User])
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
}
