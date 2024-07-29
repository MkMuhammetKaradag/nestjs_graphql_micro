import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Inject,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AppService } from './app.service';
import { ClientProxy } from '@nestjs/microservices';
import { Response } from 'express';
import { catchError, of, switchMap } from 'rxjs';
import { UserLoginResponse } from './InputTypes/user-object';
import { ForgotPasswordDto, UserLoginInput } from './InputTypes/user-Input';
import { ReturnDocument } from 'typeorm';
import { AuthGuard } from '@app/shared';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    @Inject('AUTH_SERVICE')
    private readonly authService: ClientProxy,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('auth')
  async getUsers() {
    console.log('hello api');
    return this.authService.send(
      {
        cmd: 'get_users',
      },
      {},
    );
  }
  @Post('auth/login')
  async login(@Body() userlogin: UserLoginInput, @Res() res: Response) {
    // console.log(res);

    const data = this.authService
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
            res.send({ loginUserResponse });
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

    return data;
  }

  @Get('test_auth')
  @UseGuards(AuthGuard)
  async getAuth() {
    return 'hellomami';
  }

  @Post('auth/forgotPassword')
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return this.authService.send(
      {
        cmd: 'forgot-password',
      },
      {
        email: forgotPasswordDto.email,
      },
    );
  }
}
