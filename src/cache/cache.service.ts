import { Injectable, Logger } from '@nestjs/common';
import { RedisService } from '../redis/redis.service';
import { CACHE_KEYS, CACHE_TTL_SECONDS } from './cache.constants';

type CacheEnvelope<T> = {
  value: T;
  staleAt: number;
};

@Injectable()
export class CacheService {
  private readonly logger = new Logger(CacheService.name);

  constructor(private readonly redisService: RedisService) {}

  async getJSON<T>(key: string): Promise<T | null> {
    try {
      const raw = await this.redisService.get(key);
      if (!raw) return null;
      return JSON.parse(raw) as T;
    } catch {
      return null;
    }
  }

  async setJSON<T>(key: string, value: T, ttlSeconds?: number): Promise<void> {
    const payload = JSON.stringify(value);
    await this.redisService.set(key, payload, ttlSeconds);
  }

  async del(key: string): Promise<void> {
    await this.redisService.del(key);
  }

  async deleteByPrefix(prefix: string): Promise<void> {
    await this.redisService.deleteByPrefix(prefix);
  }

  async getOrSet<T>(
    key: string,
    ttlSeconds: number,
    loader: () => Promise<T>,
  ): Promise<T> {
    try {
      const cached = await this.getJSON<T>(key);
      if (cached !== null) return cached;
      const fresh = await loader();
      await this.setJSON(key, fresh, ttlSeconds);
      return fresh;
    } catch (error) {
      this.logger.warn(
        `Cache fallback for key ${key}: ${(error as Error).message}`,
      );
      return loader();
    }
  }

  async getSWR<T>(
    key: string,
    hardTtlSeconds: number,
    softTtlSeconds: number,
    loader: () => Promise<T>,
  ): Promise<T> {
    const cached = await this.getJSON<CacheEnvelope<T>>(key);
    const now = Date.now();

    if (cached) {
      if (cached.staleAt > now) {
        return cached.value;
      }

      const lockKey = CACHE_KEYS.swrLock(key);
      const acquired = await this.redisService.set(
        lockKey,
        '1',
        30,
        true,
      );

      if (acquired) {
        void (async () => {
          try {
            const refreshed = await loader();
            await this.setJSON<CacheEnvelope<T>>(
              key,
              { value: refreshed, staleAt: Date.now() + softTtlSeconds * 1000 },
              hardTtlSeconds,
            );
          } catch (error) {
            this.logger.warn(
              `SWR refresh failed for ${key}: ${(error as Error).message}`,
            );
          } finally {
            await this.del(lockKey);
          }
        })();
      }

      return cached.value;
    }

    const fresh = await loader();
    await this.setJSON<CacheEnvelope<T>>(
      key,
      { value: fresh, staleAt: Date.now() + softTtlSeconds * 1000 },
      hardTtlSeconds,
    );
    return fresh;
  }

  async getCachedPermissions(userId: string): Promise<string[] | null> {
    return this.getJSON<string[]>(CACHE_KEYS.userPermissions(userId));
  }

  async setCachedPermissions(userId: string, permissions: string[]): Promise<void> {
    await this.setJSON(
      CACHE_KEYS.userPermissions(userId),
      permissions,
      CACHE_TTL_SECONDS.rbacPermissions,
    );
  }

  async setSessionMetadata(
    sessionId: string,
    metadata: Record<string, unknown>,
  ): Promise<void> {
    await this.setJSON(
      CACHE_KEYS.userSession(sessionId),
      metadata,
      CACHE_TTL_SECONDS.sessionMetadata,
    );
  }

  async getSessionMetadata(
    sessionId: string,
  ): Promise<Record<string, unknown> | null> {
    return this.getJSON<Record<string, unknown>>(CACHE_KEYS.userSession(sessionId));
  }
}
