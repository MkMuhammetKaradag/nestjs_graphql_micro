import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { ConfigModule } from '@nestjs/config';
import {
  PostgresDBModule,
  SharedModule,
  SharedService,
  UserEntity,
  UsersRepository,
} from '@app/shared';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    SharedModule,
    PostgresDBModule,
    TypeOrmModule.forFeature([UserEntity]),
  ],
  controllers: [AuthController],
  providers: [
    {
      provide: 'AuthServiceInterface',
      useClass: AuthService,
    },
    {
      provide: 'SharedServiceInterface',
      useClass: SharedService,
    },
    {
      provide: 'UsersRepositoryInterface',
      useClass: UsersRepository,
    },
  ],
})
export class AuthModule {}
