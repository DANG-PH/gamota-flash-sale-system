import { Module, Global } from '@nestjs/common';
import { RedisStockService } from './redis-stock.service';

@Global()
@Module({
  providers: [RedisStockService],
  exports: [RedisStockService],
})
export class RedisStockModule {}
