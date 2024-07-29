import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { ClientProxy } from '@nestjs/microservices';
import { Request } from 'express';
import { catchError, Observable, of, switchMap } from 'rxjs';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    @Inject('AUTH_SERVICE')
    private readonly authService: ClientProxy,
  ) {}
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    function getCookie(
      cookieHeader: string,
      cookieName: string,
    ): string | null {
      const cookies = cookieHeader.split(';');
      for (const cookie of cookies) {
        const [name, ...value] = cookie.trim().split('=');
        if (name === cookieName) {
          return value.join('=');
        }
      }
      return null;
    }

    if (
      context.getType() !== 'http' &&
      context.getType().toString() !== 'graphql'
    ) {
      return false;
    }
    const gqlContext = GqlExecutionContext.create(context);
    const request =
      context.getType().toString() !== 'graphql'
        ? context.switchToHttp().getRequest()
        : gqlContext.getContext().req;

    // const symbols = Object.getOwnPropertySymbols(request);
    // const kHeaders = symbols.find(
    //   (symbol) => symbol.toString() === 'Symbol(kHeaders)',
    // );
    // const headers = kHeaders ? request[kHeaders] : {};
    // const cookieHeader = headers.cookie;
    // const token = getCookie(cookieHeader, 'token');
    // console.log('Token:', token);
    const authHeader = request.headers.authorization as string;
    // console.log(authHeader, 'mami:');
    if (!authHeader) return false;
    const authHeaderParts = (authHeader as string).split(' ');

    if (authHeaderParts.length !== 2) return false;

    const [, jwt] = authHeaderParts;

    return this.authService.send({ cmd: 'verify-jwt' }, { jwt }).pipe(
      switchMap(({ user, exp }) => {
        if (!exp) return of(false);

        const TOKEN_EXP_MS = exp * 1000;

        const isJwtValid = Date.now() < TOKEN_EXP_MS;
        request.user = user;
        return of(isJwtValid);
      }),
      catchError(() => {
        console.log('hello error');
        throw new UnauthorizedException();
      }),
    );
  }
}
