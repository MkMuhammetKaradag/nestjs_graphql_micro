import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import {
  CloudinaryModule,
  DateTimeScalar,
  PubSubModule,
  SharedModule,
  User,
  UserSchema,
} from '@app/shared';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver } from '@nestjs/apollo';
import { join } from 'path';
// import { ApolloServerPluginLandingPageGraphQLPlayground } from 'apollo-server-core';
import { AppResolver } from './app.resolver';
import * as cookieParser from 'cookie-parser';
import { ProductResolver } from './resolvers/product.resolver';
import { ServeStaticModule } from '@nestjs/serve-static';
import { ShoppingCartResolver } from './resolvers/shoppingCart.resolver';
import { ChatResolver } from './resolvers/chat.resolver';
import { PaymentResolver } from './resolvers/payment.resolver';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'),
      serveRoot: '/',
    }),
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    CloudinaryModule,
    SharedModule.registerRmq('AUTH_SERVICE', process.env.RABBITMQ_AUTH_QUEUE),
    SharedModule.registerRmq(
      'PRODUCT_SERVICE',
      process.env.RABBITMQ_PRODUCT_QUEUE,
    ),
    SharedModule.registerRmq('CHAT_SERVICE', process.env.RABBITMQ_CHAT_QUEUE),
    SharedModule.registerRmq(
      'PAYMENT_SERVICE',
      process.env.RABBITMQ_PAYMENT_QUEUE,
    ),

    GraphQLModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],

      driver: ApolloDriver,
      useFactory: async (configService: ConfigService) => ({
        playground: Boolean(configService.get('GRAPHQL_PLAYGROUND')),
        autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
        uploads: false,

        context: ({ req, res, connection }) => {
          if (connection) {
            return { req: connection.context, res };
          }
          return { req, res };
        },
        // installSubscriptionHandlers: true,
        subscriptions: {
          'subscriptions-transport-ws': {
            onConnect: (connectionParams, webSocket, context) => {
              const cookies = connectionParams.cookies
                ? cookieParser.JSONCookies(connectionParams.cookies)
                : {};

              if (connectionParams.Authorization) {
                return {
                  req: {
                    headers: {
                      authorization: connectionParams.Authorization,
                    },
                    cookies: cookies,
                  },
                };
              }
              throw new Error('Missing auth token!');
            },
          },
        },
      }),
    }),

    PubSubModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    AppResolver,
    ProductResolver,
    ShoppingCartResolver,
    ChatResolver,
    PaymentResolver,
  ],
})
export class AppModule {}
