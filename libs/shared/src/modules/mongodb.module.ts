import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    // MongooseModule.forRoot('mongodb://localhost/nestjs-demo'),
  ],
  controllers: [],
  providers: [],
})
export class MongoDBModule {}
