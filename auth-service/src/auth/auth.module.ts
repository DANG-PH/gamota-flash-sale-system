import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthEntity } from './auth.entity';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';

@Module({
  imports: [

    // Đăng kí client RabbitMQ
    ClientsModule.register([
      {
        name: String(process.env.RABBIT_SERVICE),
        transport: Transport.RMQ,
        options: {
          urls: [String(process.env.RABBIT_URL)],
          queue: process.env.RABBIT_QUEUE,
          queueOptions: { durable: true },
        },
      },
    ]),

    TypeOrmModule.forFeature([AuthEntity]),

    JwtModule.registerAsync({
      useFactory: async (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET'),
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [AuthService],
  exports: [AuthService, JwtModule],
  controllers: [AuthController],
})
export class AuthModule {}