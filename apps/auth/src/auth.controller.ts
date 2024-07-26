import { Controller, Get, Inject, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import {
  Ctx,
  MessagePattern,
  Payload,
  RmqContext,
} from '@nestjs/microservices';
import { SharedService } from '@app/shared';
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

  @MessagePattern({
    cmd: 'register',
  })
  async register(@Ctx() context: RmqContext, @Payload() newUser: NewUserDTO) {
    this.sharedService.acknowledgeMessage(context);

    return this.authService.register(newUser);
  }

  @MessagePattern({
    cmd: 'login',
  })
  async login(@Ctx() context: RmqContext, @Payload() loginUser: LoginUserDTO) {
    this.sharedService.acknowledgeMessage(context);

    return this.authService.login(loginUser);
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
}
