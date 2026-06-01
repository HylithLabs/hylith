import { InjectQueue } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import { Queue } from 'bullmq';
import { STANDARD_JOB_RETRY } from '../resilience/retry-policy';

@Injectable()
export class CalendarService {
  constructor(@InjectQueue('calendar-queue') private readonly calendarQueue: Queue) {}

  async createMeetingEvent(meetingId: string) {
    await this.calendarQueue.add('create-event', { meetingId }, STANDARD_JOB_RETRY);
  }

  async cancelMeetingEvent(meetingId: string) {
    await this.calendarQueue.add('cancel-event', { meetingId }, STANDARD_JOB_RETRY);
  }
}
