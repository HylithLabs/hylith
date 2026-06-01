import { InjectQueue } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import { Queue } from 'bullmq';
import { STANDARD_JOB_RETRY } from '../../resilience/retry-policy';
import { DomainEvent } from '../events.types';

@Injectable()
export class QueueTriggerConsumer {
  constructor(
    @InjectQueue('calendar-queue') private readonly calendarQueue: Queue,
    @InjectQueue('email-queue') private readonly emailQueue: Queue,
  ) {}

  async handle(event: DomainEvent): Promise<void> {
    switch (event.name) {
      case 'meeting.created': {
        const payload = event.payload as { meetingId: string };
        await this.calendarQueue.add(
          'create-event',
          { meetingId: payload.meetingId },
          STANDARD_JOB_RETRY,
        );
        return;
      }
      case 'meeting.cancelled': {
        const payload = event.payload as { meetingId: string };
        await this.calendarQueue.add(
          'cancel-event',
          { meetingId: payload.meetingId },
          STANDARD_JOB_RETRY,
        );
        return;
      }
      case 'calendar.synced': {
        const payload = event.payload as {
          action: 'create' | 'cancel';
          meetingId: string;
        };
        if (payload.action === 'create') {
          await this.emailQueue.add(
            'send-confirmation-by-id',
            { meetingId: payload.meetingId },
            STANDARD_JOB_RETRY,
          );
        } else {
          await this.emailQueue.add(
            'send-cancellation-by-id',
            { meetingId: payload.meetingId },
            STANDARD_JOB_RETRY,
          );
        }
        return;
      }
      default:
        return;
    }
  }
}
