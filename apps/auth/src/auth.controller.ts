import { Controller, Get, Inject, UseFilters, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import {
  Ctx,
  MessagePattern,
  Payload,
  RmqContext,
} from '@nestjs/microservices';
import { AllRpcExceptionsFilter, SharedService } from '@app/shared';
import { NewUserDTO } from './dtos/new-user.dto';
import { LoginUserDTO } from './dtos/login-user.dto';
import { JwtGuard } from './jwt.guard';
import { RolesGuard } from '../../../libs/shared/src/guards/role.guard';
import { Roles } from '../../../libs/shared/src/guards/roles.decorator';
import { Query } from '@nestjs/graphql';

@Controller()
export class AuthController {
  constructor(
    @Inject('AuthServiceInterface')
    private readonly authService: AuthService,
    @Inject('SharedServiceInterface')
    private readonly sharedService: SharedService,
  ) {}

  @Get()
  getHello(): string {
    return this.authService.getHello();
  }

  @MessagePattern({ cmd: 'get_users' })
  async getUser(@Ctx() context: RmqContext) {
    this.sharedService.acknowledgeMessage(context);

    const users = await this.authService.getUsers();

    return users;
  }

  @MessagePattern({ cmd: 'get-me' })
  async getMe(
    @Ctx() context: RmqContext,
    @Payload()
    getMeDto: {
      userId: number;
    },
  ) {
    this.sharedService.acknowledgeMessage(context);

    const user = await this.authService.getMe(getMeDto.userId);

    return user;
  }

  @MessagePattern({
    cmd: 'register',
  })
  async register(@Ctx() context: RmqContext, @Payload() newUser: NewUserDTO) {
    this.sharedService.acknowledgeMessage(context);

    return this.authService.register(newUser);
  }

  @MessagePattern({
    cmd: 'activate_user',
  })
  async activateUser(
    @Ctx() context: RmqContext,
    @Payload()
    activationDto: {
      activationToken: string;
      activationCode: string;
    },
  ) {
    this.sharedService.acknowledgeMessage(context);
    return this.authService.activateUser(activationDto);
  }
  @MessagePattern({
    cmd: 'login',
  })
  @UseFilters(AllRpcExceptionsFilter)
  async login(@Ctx() context: RmqContext, @Payload() loginUser: LoginUserDTO) {
    this.sharedService.acknowledgeMessage(context);

    const data = this.authService.login(loginUser);
    return data;
  }

  @MessagePattern({
    cmd: 'verify-jwt',
  })
  @UseGuards(JwtGuard)
  async verifyJwt(
    @Ctx() context: RmqContext,
    @Payload() payload: { jwt: string },
  ) {
    this.sharedService.acknowledgeMessage(context);

    return this.authService.verifyJwt(payload.jwt);
  }

  @MessagePattern({ cmd: 'decode-jwt' })
  async decodeJwt(
    @Ctx() context: RmqContext,
    @Payload() payload: { jwt: string },
  ) {
    this.sharedService.acknowledgeMessage(context);

    return this.authService.getUserFromHeader(payload.jwt);
  }

  @MessagePattern({ cmd: 'forgot-password' })
  async forgotPassword(
    @Ctx() context: RmqContext,
    @Payload() payload: { email: string },
  ) {
    this.sharedService.acknowledgeMessage(context);

    return this.authService.forgotPassword(payload.email);
  }

  @MessagePattern({ cmd: 'reset-password' })
  async resetPassword(
    @Ctx() context: RmqContext,
    @Payload() payload: { password: string; activationToken: string },
  ) {
    this.sharedService.acknowledgeMessage(context);

    return this.authService.resetPassword(payload);
  }
}
