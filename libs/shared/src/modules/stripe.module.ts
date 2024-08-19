import { Global, Module } from '@nestjs/common';
import { EmailService } from '../service/email.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { join } from 'path';
import { MailerModule } from '@nestjs-modules/mailer';
import { EjsAdapter } from '@nestjs-modules/mailer/dist/adapters/ejs.adapter';
import { StripeService } from '../service/stripe.service';
@Global()
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
  ],
  providers: [StripeService],
  exports: [StripeService],
})
export class StripeModule {}
