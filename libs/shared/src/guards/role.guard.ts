import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const roles = this.reflector.get<string[]>('roles', context.getHandler());
    if (!roles) {
      return true;
    }

    const ctx = GqlExecutionContext.create(context);
    // console.log(ctx.getContext().req);
    const { user } = ctx.getContext().req;
    // console.log(user);
    const hasRole = () => user.roles.some((role) => roles.includes(role));
    if (!user || !hasRole()) {
      throw new ForbiddenException('You do not have the required roles');
    }
    return true;
  }
}
