import { Module } from '@nestjs/common';
import { QueueModule } from './queue/queue.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { RedisModule } from './redis/redis.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,           
      envFilePath: '.env',     
    }),
    QueueModule,
    RedisModule
  ],
})
export class AppModule {}