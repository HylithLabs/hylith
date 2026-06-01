import {
  Injectable,
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { RedisService } from '../redis/redis.service';
import { Request } from 'express';

@Injectable()
export class RateLimiterGuard implements CanActivate {
  private readonly logger = new Logger(RateLimiterGuard.name);
  
  // Local in-memory fallback map if Redis is down
  private localFallbackMap = new Map<string, number[]>();

  constructor(private readonly redisService: RedisService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const ip = request.ip || request.socket.remoteAddress || 'unknown-ip';
    
    // Extract user ID if present from JWT session context
    const user = (request as any).user;
    const identifier = user ? `user:${user.id}` : `ip:${ip}`;
    
    const path = request.path;
    let limit = 100; // Standard limit
    let windowMs = 60000; // 1 minute

    if (path.includes('/auth/login') || path.includes('/auth/register')) {
      limit = 5;
    } else if (path.includes('/meetings') && request.method === 'POST') {
      limit = 10;
    }

    const key = `ratelimit:${identifier}:${path}`;
    const now = Date.now();

    try {
      const client = this.redisService.getClient();
      const minScore = now - windowMs;

      // Executing atomic transaction in Redis
      const pipeline = client.multi();
      pipeline.zadd(key, now, `${now}-${Math.random()}`);
      pipeline.zremrangebyscore(key, 0, minScore);
      pipeline.zcard(key);
      pipeline.expire(key, Math.ceil(windowMs / 1000));
      
      const results = await pipeline.exec();
      if (!results) {
        throw new Error('Pipeline execution failed');
      }

      // results[2][1] holds the output of ZCARD (the number of items in sorted set)
      const count = results[2][1] as number;

      if (count > limit) {
        this.logger.warn(`Rate limit exceeded for ${identifier} on ${path} (${count}/${limit})`);
        throw new HttpException(
          {
            statusCode: HttpStatus.TOO_MANY_REQUESTS,
            message: 'Too many requests. Please try again later.',
            limit,
            remaining: 0,
            retryAfterSeconds: Math.ceil(windowMs / 1000),
          },
          HttpStatus.TOO_MANY_REQUESTS,
        );
      }

      // Add Headers to Response if needed (Express interface)
      const response = context.switchToHttp().getResponse();
      if (response && typeof response.setHeader === 'function') {
        response.setHeader('X-RateLimit-Limit', limit);
        response.setHeader('X-RateLimit-Remaining', Math.max(0, limit - count));
      }

      return true;
    } catch (err) {
      if (err instanceof HttpException) {
        throw err;
      }
      
      // Redis is down: fallback gracefully to local in-memory sliding window
      this.logger.error(`Redis failure in RateLimiterGuard: ${err.message}. Falling back to local memory.`);
      return this.localFallbackCheck(key, limit, windowMs, now);
    }
  }

  private localFallbackCheck(key: string, limit: number, windowMs: number, now: number): boolean {
    const timestamps = this.localFallbackMap.get(key) || [];
    const validTimestamps = timestamps.filter(t => t > now - windowMs);
    
    if (validTimestamps.length >= limit) {
      throw new HttpException(
        'Too many requests (Local fallback limit reached).',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }
    
    validTimestamps.push(now);
    this.localFallbackMap.set(key, validTimestamps);
    return true;
  }
}
