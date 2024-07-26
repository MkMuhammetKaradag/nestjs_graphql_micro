import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JwtRequest } from './interfaces/jwt-request.interface';
import { Request } from 'express';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        JwtStrategy.extractJWT,
        ExtractJwt.fromAuthHeaderAsBearerToken(),
        // (request: JwtRequest) => {
        //   // console.log(request?.jwt);
        //   // return false;
        //   return request?.jwt;
        // },
      ]),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET,
    });
  }
  private static extractJWT(req: JwtRequest): string | null {
    // console.log(req);
    if (req.jwt) {
      return req.jwt;
    }
    return null;
  }
  async validate(payload: any) {
    // console.log("payload",payload);
    return { ...payload };
  }
}
