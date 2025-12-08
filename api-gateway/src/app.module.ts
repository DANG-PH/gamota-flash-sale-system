import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { TicketModule } from './service/ticket/ticket.module';
import { NestModule } from '@nestjs/common';
import { MiddlewareConsumer } from '@nestjs/common';
import { RateLimitMiddleware } from './security/rate_limit/rate_limit.middleware';
import { RedisModule } from './redis/redis.module';
import { AuthModule } from './service/auth/auth.module';
import { AdminModule } from './service/admin/admin.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,           
      envFilePath: '.env',     
    }),
    RedisModule,
    AuthModule,
    AdminModule,
    TicketModule,
    RedisModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RateLimitMiddleware).forRoutes('*');
  }
}
