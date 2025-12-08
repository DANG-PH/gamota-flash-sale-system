import { Module, Global } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import KeyvRedis from '@keyv/redis';
import { Keyv } from 'keyv';
import { CacheableMemory } from 'cacheable';


@Global()
@Module({
  imports: [
    CacheModule.registerAsync({
      useFactory: async () => {
        return {
          stores: [
            new Keyv({
              store: new CacheableMemory({ ttl: 0, lruSize: 5000 }),
            }),
            new KeyvRedis(process.env.REDIS_URL), 
          ],
          ttl: 0,
          namespace: process.env.NAME_SPACE_CACHE_KEY
        };
      },
    }),
  ],
  exports: [CacheModule],
})
export class RedisModule {}
