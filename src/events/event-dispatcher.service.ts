import { Injectable } from '@nestjs/common';
import { AuditLogConsumer } from './consumers/audit-log.consumer';
import { CacheInvalidationConsumer } from './consumers/cache-invalidation.consumer';
import { QueueTriggerConsumer } from './consumers/queue-trigger.consumer';
import { WebsocketEventConsumer } from './consumers/websocket-event.consumer';
import { DomainEvent } from './events.types';

@Injectable()
export class EventDispatcherService {
  constructor(
    private readonly websocketConsumer: WebsocketEventConsumer,
    private readonly cacheInvalidationConsumer: CacheInvalidationConsumer,
    private readonly queueTriggerConsumer: QueueTriggerConsumer,
    private readonly auditLogConsumer: AuditLogConsumer,
  ) {}

  async dispatch(event: DomainEvent): Promise<void> {
    await this.websocketConsumer.handle(event);
    await this.cacheInvalidationConsumer.handle(event);
    await this.queueTriggerConsumer.handle(event);
    await this.auditLogConsumer.handle(event);
  }
}
