import { InjectQueue } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import { Queue } from 'bullmq';
import { STANDARD_JOB_RETRY } from '../resilience/retry-policy';

@Injectable()
export class EmailService {
  constructor(@InjectQueue('email-queue') private readonly emailQueue: Queue) {}

  async sendBookingConfirmation(meeting: any) {
    await this.emailQueue.add(
      'send-confirmation',
      {
        email: meeting.clientEmail,
        name: meeting.clientName,
        meetingDate: meeting.meetingDate,
        duration: meeting.duration,
        projectDescription: meeting.projectDescription,
        meetLink: meeting.meetLink,
      },
      STANDARD_JOB_RETRY,
    );
  }

  async sendCancellationNotification(meeting: any) {
    await this.emailQueue.add(
      'send-cancellation',
      {
        email: meeting.clientEmail,
        name: meeting.clientName,
        meetingDate: meeting.meetingDate,
      },
      STANDARD_JOB_RETRY,
    );
  }
}
