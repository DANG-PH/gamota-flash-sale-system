import { Injectable } from '@nestjs/common';
import { Redis } from 'ioredis';

@Injectable()
export class RedisStockService {
  private redis: Redis;
  private luaSha: string;

  constructor() {
    this.redis = new Redis(process.env.REDIS_URL ?? 'redis://localhost:6379');
    this.loadLuaScript();
  }

  private async loadLuaScript() {
    const lua = `
      -- Lấy stock dưới dạng JSON
      local stockJson = redis.call('GET', KEYS[1])
      local qty = tonumber(ARGV[1])

      if not stockJson then
          return -2 -- stock chưa khởi tạo
      end

      -- parse JSON
      local stockTable = cjson.decode(stockJson)
      local stock = tonumber(stockTable.value)
      if not stock then
          return -3 -- stock không phải số nguyên
      end

      if stock < qty then
          return -1 -- không đủ stock
      end

      -- giảm stock
      stock = stock - qty
      stockTable.value = stock

      -- lưu lại dưới dạng JSON
      redis.call('SET', KEYS[1], cjson.encode(stockTable))

      return stock
    `;

    // Load script vào Redis
    const sha = await this.redis.script('LOAD', lua);
    this.luaSha = sha as string;
  }

  async decreaseStock(eventId: number, qty: number): Promise<number> {
    // FIX: cast result về number
    const result = await this.redis.evalsha(
      this.luaSha,
      1,
      `hdgstudio::hdgstudio:event:${eventId}:stock`,
      qty,
    );
    return result as number;
  }

  async increaseStock(eventId: number, qty: number): Promise<number> {
    const result = await this.redis.incrby(`hdgstudio::hdgstudio:event:${eventId}:stock`, qty);
    return result as number;
  }
}
