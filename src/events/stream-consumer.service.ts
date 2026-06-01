import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { Subscription } from 'rxjs';
import { EventDispatcherService } from './event-dispatcher.service';
import { DomainEvent } from './events.types';
import { RedisService } from '../redis/redis.service';
import { EventBusService } from './event-bus.service';

@Injectable()
export class StreamConsumerService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(StreamConsumerService.name);
  private readonly streamKey = 'hylith:events';
  private readonly dlqKey = 'hylith:events:dlq';
  private readonly group = 'hylith-backend-group';
  private readonly consumer = `consumer-${process.pid}`;
  
  private running = false;
  private pollTimer?: NodeJS.Timeout;
  private pendingTimer?: NodeJS.Timeout;
  private rxSubscription?: Subscription;

  // In-memory retry counter for poison message isolation
  private readonly messageRetryMap = new Map<string, number>();

  constructor(
    private readonly redisService: RedisService,
    private readonly eventBusService: EventBusService,
    private readonly dispatcher: EventDispatcherService,
  ) {}

  async onModuleInit(): Promise<void> {
    try {
      await this.redisService.xgroupCreate(this.streamKey, this.group, '0', true);
    } catch (err) {
      this.logger.debug(`Consumer group initialization skipped: ${(err as Error).message}`);
    }
    
    this.running = true;
    this.startLoop();
    this.startPendingRecovery();

    // RxJS fallback subscription for when Redis is offline and events are published locally
    this.rxSubscription = this.eventBusService.localEvents$.subscribe({
      next: async (event) => {
        this.logger.warn(`Fallback: Consuming event ${event.name} directly from in-memory RxJS bus.`);
        try {
          await this.dispatcher.dispatch(event);
        } catch (error) {
          this.logger.error(`Fallback dispatch failed for ${event.name}: ${(error as Error).message}`);
        }
      },
    });
  }

  async onModuleDestroy(): Promise<void> {
    this.running = false;
    if (this.pollTimer) clearTimeout(this.pollTimer);
    if (this.pendingTimer) clearInterval(this.pendingTimer);
    if (this.rxSubscription) this.rxSubscription.unsubscribe();
  }

  private startLoop(): void {
    const poll = async () => {
      if (!this.running) return;

      let sleepMs = 200;
      let fetchCount = 50;

      try {
        const client = this.redisService.getClient();
        
        // 1. BACKPRESSURE: Check Stream Lag via XPENDING summary
        const pendingSummary = await client.xpending(this.streamKey, this.group) as any;
        if (pendingSummary && pendingSummary.length > 0) {
          const totalPending = pendingSummary[0] as number;
          if (totalPending > 200) {
            // Apply severe throttling under backpressure
            fetchCount = 5;
            sleepMs = 50;
            this.logger.warn(`⚠️ High consumer lag detected (${totalPending} pending). Scaling down batch count to 5 and injecting 50ms sleep.`);
          }
        }

        const entries = await this.redisService.xreadgroup(
          this.group,
          this.consumer,
          this.streamKey,
          '>',
          fetchCount,
          2000,
        );

        if (entries && entries.length > 0) {
          await this.processEntries(entries);
        }
      } catch (error) {
        this.logger.warn(`Stream polling warning (Redis down or slow): ${(error as Error).message}`);
        sleepMs = 5000; // Slow down checking if Redis is unresponsive
      } finally {
        this.pollTimer = setTimeout(poll, sleepMs);
      }
    };

    void poll();
  }

  private startPendingRecovery(): void {
    this.pendingTimer = setInterval(async () => {
      if (!this.running) return;
      try {
        const claimed = await this.redisService.xautoclaim(
          this.streamKey,
          this.group,
          this.consumer,
          60000,
          '0-0',
          20,
        );
        if (claimed && claimed.length > 0) {
          this.logger.log(`Recovered ${claimed.length} abandoned pending stream messages.`);
          await this.processEntries(claimed);
        }
      } catch (error) {
        this.logger.debug(`Pending recovery check skipped: ${(error as Error).message}`);
      }
    }, 10000);
  }

  private async processEntries(
    entries: Array<{ id: string; fields: Record<string, string> }>,
  ): Promise<void> {
    for (const entry of entries) {
      const body = entry.fields.event_body;
      if (!body) {
        // Acknowledge malformed frame immediately to clear it
        await this.redisService.xack(this.streamKey, this.group, entry.id);
        continue;
      }

      let event: DomainEvent;
      try {
        event = JSON.parse(body) as DomainEvent;
      } catch (parseError) {
        this.logger.error(`JSON Parse failure on stream entry ${entry.id}. Sent to DLQ.`);
        await this.sendToDLQ(entry.id, body, (parseError as Error).message);
        continue;
      }

      try {
        // Dispatch to all local consumer boundaries (WebSockets, Queues, Cache, Logs)
        await this.dispatcher.dispatch(event);
        
        // Success: acknowledge the stream entry and remove retry counters
        await this.redisService.xack(this.streamKey, this.group, entry.id);
        this.messageRetryMap.delete(entry.id);
      } catch (dispatchError) {
        const attempts = (this.messageRetryMap.get(entry.id) || 0) + 1;
        this.messageRetryMap.set(entry.id, attempts);

        this.logger.error(
          `Error processing event ${event.name} (Attempt ${attempts}/3) on stream ID ${entry.id}: ${(dispatchError as Error).message}`,
        );

        if (attempts >= 3) {
          // 2. POISON ISOLATION: Shift to DLQ and ACK to prevent infinite loop
          this.logger.error(`🚨 Message exceeded max retries. Isolating event ${event.name} with ID ${event.id} to DLQ.`);
          await this.sendToDLQ(entry.id, body, (dispatchError as Error).message);
          this.messageRetryMap.delete(entry.id);
        }
      }
    }
  }

  private async sendToDLQ(streamId: string, eventBody: string, errorReason: string): Promise<void> {
    try {
      await this.redisService.xadd(this.dlqKey, '*', [
        'original_stream_id',
        streamId,
        'failed_at',
        new Date().toISOString(),
        'error_reason',
        errorReason,
        'event_body',
        eventBody,
      ]);
      // Acknowledge the message on the primary stream so it's not redelivered
      await this.redisService.xack(this.streamKey, this.group, streamId);
    } catch (err) {
      this.logger.error(`CRITICAL: Failed writing to Dead Letter Queue stream: ${(err as Error).message}`);
    }
  }
}
