import { Injectable, Logger } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { Subject } from 'rxjs';
import { RedisService } from '../redis/redis.service';
import { DomainEvent, DomainEventName, DomainEventPayload } from './events.types';

@Injectable()
export class EventBusService {
  private readonly logger = new Logger(EventBusService.name);
  private readonly streamKey = 'hylith:events';

  // RxJS fallback event emitter for degraded single-node memory-only operations
  private readonly localFallbackSubject = new Subject<DomainEvent<any>>();
  public readonly localEvents$ = this.localFallbackSubject.asObservable();

  // Local memory deduplication cache for fallback operations
  private readonly localDeduplicationSet = new Set<string>();

  constructor(private readonly redisService: RedisService) {}

  async publish<T extends DomainEventName>(
    name: T,
    payload: DomainEventPayload<T>,
    source = 'hylith-backend',
  ): Promise<DomainEvent<T>> {
    const eventId = randomUUID();
    const event: DomainEvent<T> = {
      id: eventId,
      occurredAt: new Date().toISOString(),
      source,
      name,
      payload,
    };

    // 1. Generate deterministic idempotency key
    const idempotencyKey = `idempotency:event:${event.name}:${event.id}`;

    try {
      // 2. Perform atomic SET NX check in Redis
      const isUnique = await this.redisService.set(idempotencyKey, '1', 3600, true);
      if (!isUnique) {
        this.logger.warn(`Duplicate event suppressed at publisher: ${event.name} with ID ${event.id}`);
        return event;
      }

      // 3. Append to Redis Stream
      await this.redisService.xadd(this.streamKey, '*', [
        'event_id',
        event.id,
        'event_name',
        event.name,
        'event_body',
        JSON.stringify(event),
      ]);
    } catch (error) {
      // Redis is offline: log warning and run the memory fallback route (degraded mode)
      this.logger.error(
        `Redis publish failed for ${event.name} (${(error as Error).message}). Executing RxJS local fallback routing.`,
      );

      // Perform local memory deduplication check
      if (this.localDeduplicationSet.has(idempotencyKey)) {
        this.logger.warn(`Duplicate event suppressed in local memory fallback: ${event.name}`);
        return event;
      }

      this.localDeduplicationSet.add(idempotencyKey);
      // Evict memory keys after 1 hour to prevent memory bloat
      setTimeout(() => this.localDeduplicationSet.delete(idempotencyKey), 3600000);

      // Emit locally so in-memory consumers receive it
      this.localFallbackSubject.next(event);
    }

    return event;
  }
}

