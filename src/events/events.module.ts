import { BullModule } from '@nestjs/bullmq';
import { Global, Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { RealtimeModule } from '../realtime/realtime.module';
import { AuditLogConsumer } from './consumers/audit-log.consumer';
import { CacheInvalidationConsumer } from './consumers/cache-invalidation.consumer';
import { QueueTriggerConsumer } from './consumers/queue-trigger.consumer';
import { WebsocketEventConsumer } from './consumers/websocket-event.consumer';
import { EventBusService } from './event-bus.service';
import { EventDispatcherService } from './event-dispatcher.service';
import { StreamConsumerService } from './stream-consumer.service';

@Global()
@Module({
  imports: [
    RealtimeModule,
    PrismaModule,
    BullModule.registerQueue(
      { name: 'calendar-queue' },
      { name: 'email-queue' },
    ),
  ],
  providers: [
    EventBusService,
    EventDispatcherService,
    StreamConsumerService,
    WebsocketEventConsumer,
    CacheInvalidationConsumer,
    QueueTriggerConsumer,
    AuditLogConsumer,
  ],
  exports: [EventBusService],
})
export class EventsModule {}
