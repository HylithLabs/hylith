import { Injectable, Logger } from '@nestjs/common';
import { RedisService } from '../redis/redis.service';

@Injectable()
export class RealtimeService {
  private readonly logger = new Logger(RealtimeService.name);
  private readonly STREAM_NAME = 'realtime:events';

  constructor(private readonly redisService: RedisService) {}

  /**
   * Publishes a real-time event to the shared Redis Stream.
   * Enables multi-instance communication and event persistence.
   */
  async publishEvent(channel: string, eventName: string, payload: any) {
    try {
      const client = this.redisService.getClient();
      
      const payloadString = JSON.stringify(payload);
      
      // XADD key ID field value [field value ...]
      // ID '*' means auto-generate timestamp-based incremental ID
      await client.xadd(
        this.STREAM_NAME,
        '*',
        'channel',
        channel,
        'event',
        eventName,
        'payload',
        payloadString,
      );

      this.logger.debug(`Published event ${eventName} to channel ${channel} in Redis stream`);
    } catch (err) {
      this.logger.error(`Failed to publish event to Redis stream: ${err.message}`, err.stack);
    }
  }
}
