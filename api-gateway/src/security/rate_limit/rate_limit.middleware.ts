import { Injectable, NestMiddleware, HttpException, HttpStatus } from '@nestjs/common';
import type { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class RateLimitMiddleware implements NestMiddleware {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const ip = req.headers['x-forwarded-for'] || req.ip 
    const key = `rate_limit_${ip}`;
    const limit = 10000; 
    const ttl = 60; 

    let count = (await this.cacheManager.get<number>(key)) || 0;
    count++;

    if (count > limit) {
      throw new HttpException(
        'Bạn gửi quá nhiều request, vui lòng thử lại sau 1 phút.',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    await this.cacheManager.set(key, count, ttl * 1000); 
    next();
  }
}