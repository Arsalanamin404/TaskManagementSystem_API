import KeyvRedis from '@keyv/redis';
import { CacheModule } from '@nestjs/cache-manager';
import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CacheService } from './cache.service';

@Global()
@Module({
  imports: [
    ConfigModule,
    CacheModule.registerAsync({
      isGlobal: true,
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const redisUrl = config.getOrThrow<string>('REDIS_URL');
        console.log('REDIS_URL at runtime:', redisUrl);
        return {
          stores: [new KeyvRedis(redisUrl)],
          ttl: 5 * 60 * 1000, // default TTL = 5 minutes
        };
      },
    }),
  ],

  providers: [CacheService],
  exports: [CacheModule, CacheService],
})
export class CacheConfigModule { }
