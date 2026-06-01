import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RedisService } from '../redis/redis.service';
import { RealtimeGateway } from './realtime.gateway';
import Redis from 'ioredis';

@Injectable()
export class RealtimeConsumer implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RealtimeConsumer.name);
  private readonly STREAM_NAME = 'realtime:events';
  private readonly GROUP_NAME = 'hylith-ws-consumers';
  private consumerName: string;
  private isRunning = false;
  private redisClient: Redis;

  constructor(
    private readonly redisService: RedisService,
    private readonly gateway: RealtimeGateway,
    private readonly configService: ConfigService,
  ) {
    this.consumerName = `node-${process.pid}-${Math.random().toString(36).substring(2, 7)}`;
  }

  async onModuleInit() {
    this.logger.log(`Initializing Redis Streams Realtime Consumer: ${this.consumerName}...`);
    
    // Create dedicated Redis client instance for blocking reads
    const redisUrl = this.configService.get<string>('REDIS_URL') || 'redis://localhost:6379';
    this.redisClient = new Redis(redisUrl);

    // Ensure the stream and consumer group exist
    try {
      await this.redisClient.xgroup('CREATE', this.STREAM_NAME, this.GROUP_NAME, '$', 'MKSTREAM');
      this.logger.log(`Created new consumer group: ${this.GROUP_NAME}`);
    } catch (err) {
      if (err.message.includes('BUSYGROUP')) {
        this.logger.debug(`Consumer group ${this.GROUP_NAME} already exists.`);
      } else {
        this.logger.error(`Failed to verify/create Redis consumer group: ${err.message}`);
      }
    }

    this.isRunning = true;
    this.pollStream();
  }

  async onModuleDestroy() {
    this.isRunning = false;
    if (this.redisClient) {
      await this.redisClient.quit();
    }
  }

  private async pollStream() {
    while (this.isRunning) {
      try {
        // Read new messages from the stream
        // xreadgroup('GROUP', group, consumer, 'COUNT', count, 'BLOCK', block, 'STREAMS', stream, id)
        // ID '>' means read only new messages that were never delivered to other consumers
        const results = (await this.redisClient.xreadgroup(
          'GROUP',
          this.GROUP_NAME,
          this.consumerName,
          'COUNT',
          10,
          'BLOCK',
          5000, // Block up to 5 seconds if no messages are available
          'STREAMS',
          this.STREAM_NAME,
          '>',
        )) as any[] | null;

        if (!results) {
          continue;
        }

        for (const [stream, messages] of results) {
          for (const [messageId, fields] of messages) {
            await this.processMessage(messageId, fields);
          }
        }
      } catch (err) {
        this.logger.error(`Error reading from Redis Stream: ${err.message}`);
        // Backoff slightly on error to prevent infinite tight loop
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }
    }
  }

  private async processMessage(messageId: string, fields: string[]) {
    try {
      // Stream logs are array of fields: [key1, value1, key2, value2, ...]
      const data: Record<string, string> = {};
      for (let i = 0; i < fields.length; i += 2) {
        data[fields[i]] = fields[i + 1];
      }

      const { channel, event, payload } = data;
      if (!channel || !event || !payload) {
        this.logger.warn(`Stale message format in Stream ID ${messageId}, skipping.`);
        await this.acknowledgeMessage(messageId);
        return;
      }

      const parsedPayload = JSON.parse(payload);

      // Route the event to local WS clients depending on channel target
      if (channel === 'admin:global') {
        this.gateway.sendToAdmin(event, parsedPayload);
      } else if (channel.startsWith('user:')) {
        const userId = channel.split(':')[1];
        this.gateway.sendToUser(userId, event, parsedPayload);
      } else if (channel.startsWith('meeting:')) {
        const meetingId = channel.split(':')[1];
        this.gateway.sendToMeeting(meetingId, event, parsedPayload);
      } else {
        this.gateway.broadcast(event, parsedPayload);
      }

      // Acknowledge processing success
      await this.acknowledgeMessage(messageId);
    } catch (err) {
      this.logger.error(`Failed to process stream message ${messageId}: ${err.message}`);
    }
  }

  private async acknowledgeMessage(messageId: string) {
    try {
      await this.redisClient.xack(this.STREAM_NAME, this.GROUP_NAME, messageId);
    } catch (err) {
      this.logger.error(`Failed to acknowledge stream message ${messageId}: ${err.message}`);
    }
  }
}
