import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private client: Redis;

  constructor(private configService: ConfigService) {}

  onModuleInit() {
    const redisUrl = this.configService.get<string>('REDIS_URL') || 'redis://localhost:6379';
    this.client = new Redis(redisUrl, {
      maxRetriesPerRequest: null, // Required configuration for BullMQ integration
      retryStrategy: (times) => Math.min(times * 1000, 5000), // Graceful retry instead of crash
      lazyConnect: true, // Prevents crashing on module init if Redis is down
    });
    this.client.on('error', () => {}); // Silence connection errors during boot
    this.client.connect().catch(() => {}); // Connect in background
  }

  async onModuleDestroy() {
    await this.client.quit();
  }

  getClient(): Redis {
    return this.client;
  }

  // Generic key-value store actions
  async get(key: string): Promise<string | null> {
    return this.client.get(key);
  }
  async set(
    key: string,
    value: string,
    ttlSeconds?: number,
    nx = false,
  ): Promise<boolean> {
    const args: Array<string | number> = [key, value];
    if (ttlSeconds) {
      args.push('EX', ttlSeconds);
    }
    if (nx) {
      args.push('NX');
    }
    const result = await this.client.set(...(args as [string, string]));
    if (nx) {
      return result === 'OK';
    }
    return true;
  }

  async del(key: string): Promise<void> {
    await this.client.del(key);
  }

  async incr(key: string): Promise<number> {
    return this.client.incr(key);
  }

  async expire(key: string, seconds: number): Promise<void> {
    await this.client.expire(key, seconds);
  }

  async deleteByPrefix(prefix: string): Promise<void> {
    const stream = this.client.scanStream({
      match: `${prefix}*`,
      count: 200,
    });

    for await (const chunk of stream) {
      const keys = chunk as string[];
      if (keys.length > 0) {
        await this.client.del(...keys);
      }
    }
  }

  async lpush(key: string, value: string): Promise<void> {
    await this.client.lpush(key, value);
  }

  async ltrim(key: string, start: number, stop: number): Promise<void> {
    await this.client.ltrim(key, start, stop);
  }

  async lrange(key: string, start: number, stop: number): Promise<string[]> {
    return this.client.lrange(key, start, stop);
  }

  async xadd(stream: string, id: string, fields: string[]): Promise<string> {
    const result = await this.client.xadd(stream, id, ...fields);
    return result || '';
  }

  async xgroupCreate(
    stream: string,
    group: string,
    id = '$',
    mkstream = false,
  ): Promise<void> {
    try {
      if (mkstream) {
        await this.client.xgroup('CREATE', stream, group, id, 'MKSTREAM');
      } else {
        await this.client.xgroup('CREATE', stream, group, id);
      }
    } catch (error) {
      if (
        !(error instanceof Error) ||
        !error.message.includes('BUSYGROUP Consumer Group name already exists')
      ) {
        throw error;
      }
    }
  }

  async xreadgroup(
    group: string,
    consumer: string,
    stream: string,
    id: string,
    count = 10,
    blockMs = 1000,
  ): Promise<Array<{ id: string; fields: Record<string, string> }>> {
    const raw = (await this.client.xreadgroup(
      'GROUP',
      group,
      consumer,
      'COUNT',
      count,
      'BLOCK',
      blockMs,
      'STREAMS',
      stream,
      id,
    )) as any;

    if (!raw || raw.length === 0) return [];
    const entries = raw[0][1] as Array<[string, string[]]>;

    return entries.map(([entryId, flatFields]) => {
      const fields: Record<string, string> = {};
      for (let i = 0; i < flatFields.length; i += 2) {
        fields[flatFields[i]] = flatFields[i + 1];
      }
      return { id: entryId, fields };
    });
  }

  async xack(stream: string, group: string, id: string): Promise<void> {
    await this.client.xack(stream, group, id);
  }

  async xautoclaim(
    stream: string,
    group: string,
    consumer: string,
    minIdleMs: number,
    startId: string,
    count = 10,
  ): Promise<Array<{ id: string; fields: Record<string, string> }>> {
    const raw = (await this.client.xautoclaim(
      stream,
      group,
      consumer,
      minIdleMs,
      startId,
      'COUNT',
      count,
    )) as any;

    if (!raw || raw.length < 2 || !Array.isArray(raw[1])) return [];
    const entries = raw[1] as Array<[string, string[]]>;
    return entries.map(([entryId, flatFields]) => {
      const fields: Record<string, string> = {};
      for (let i = 0; i < flatFields.length; i += 2) {
        fields[flatFields[i]] = flatFields[i + 1];
      }
      return { id: entryId, fields };
    });
  }

  // Token blacklisting actions
  async blacklistToken(jti: string, ttlSeconds: number): Promise<void> {
    await this.set(`token:blacklist:${jti}`, '1', ttlSeconds);
  }

  async isTokenBlacklisted(jti: string): Promise<boolean> {
    const res = await this.get(`token:blacklist:${jti}`);
    return res === '1';
  }
}
