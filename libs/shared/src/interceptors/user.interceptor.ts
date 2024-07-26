import {
  CallHandler,
  ExecutionContext,
  Inject,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

import { ClientProxy } from '@nestjs/microservices';

import { Observable, switchMap, catchError } from 'rxjs';

@Injectable()
export class UserInterceptor implements NestInterceptor {
  constructor(
    @Inject('AUTH_SERVICE') private readonly authService: ClientProxy,
  ) {}

  intercept(ctx: ExecutionContext, next: CallHandler): Observable<any> {
    // console.log('header', 'asas');
    if (ctx.getType() !== 'http' && ctx.getType().toString() !== 'graphql')
      return next.handle();
    const gqlContext = GqlExecutionContext.create(ctx);
    const request =
      ctx.getType().toString() !== 'graphql'
        ? ctx.switchToHttp().getRequest()
        : gqlContext.getContext().req;
    const authHeader = request.headers.authorization as string;

    if (!authHeader) return next.handle();

    const authHeaderParts = authHeader.split(' ');

    if (authHeaderParts.length !== 2) return next.handle();

    const [, jwt] = authHeaderParts;

    return this.authService.send({ cmd: 'decode-jwt' }, { jwt }).pipe(
      switchMap(({ user }) => {
        // console.log(user);
        user.test = 'test interceptor';
        request.user = user;

        return next.handle();
      }),
      catchError(() => next.handle()),
    );
  }
}
