import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Job } from 'bullmq';
import { EventBusService } from '../events/event-bus.service';
import { PrismaService } from '../prisma/prisma.service';
import { ResilienceService } from '../resilience/resilience.service';

@Processor('email-queue', { concurrency: 40 })
@Injectable()
export class EmailProcessor extends WorkerHost {
  private readonly logger = new Logger(EmailProcessor.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
    private readonly eventBus: EventBusService,
    private readonly resilienceService: ResilienceService,
  ) {
    super();
  }

  async process(job: Job<any, any, string>): Promise<any> {
    const brevoApiKey = this.configService.get<string>('BREVO_API_KEY');
    const agencyNotificationEmail =
      this.configService.get<string>('AGENCY_NOTIFICATION_EMAIL') ||
      'team@hylith.com';
    const emails = agencyNotificationEmail.split(',').map((e) => e.trim());

    if (!brevoApiKey) {
      this.logger.error('Brevo API key is not configured!');
      throw new Error('Brevo API Key missing');
    }

    let { name, email, meetingDate, duration, projectDescription, meetLink } =
      job.data;

    if (job.name === 'send-confirmation-by-id' || job.name === 'send-cancellation-by-id') {
      const meeting = await this.prisma.meeting.findUnique({
        where: { id: job.data.meetingId },
      });
      if (!meeting) {
        this.logger.warn(`Meeting ${job.data.meetingId} not found for email job`);
        return;
      }
      name = meeting.clientName;
      email = meeting.clientEmail;
      meetingDate = meeting.meetingDate;
      duration = meeting.duration;
      projectDescription = meeting.projectDescription;
      meetLink = meeting.meetLink;
    }

    const formattedDate = new Date(meetingDate).toLocaleString('en-US', {
      timeZone: this.configService.get<string>('AGENCY_TIMEZONE') || 'Asia/Dhaka',
      dateStyle: 'full',
      timeStyle: 'short',
    });

    if (job.name === 'send-confirmation' || job.name === 'send-confirmation-by-id') {
      this.logger.log(`Dispatching booking confirmation to ${email}...`);
      await this.sendBrevoEmail(brevoApiKey, {
        to: [{ email, name }],
        subject: `Discovery Meeting Confirmed - Hylith`,
        htmlContent: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
            <h2 style="color: #6366f1;">Your Meeting is Scheduled!</h2>
            <p>Hi ${name},</p>
            <p>Your discovery call is officially booked and confirmed.</p>
            <table style="width: 100%; border-collapse: collapse; margin: 20px 0; background: #f9fafb; border-radius: 8px; border: 1px solid #e5e7eb;">
              <tr>
                <td style="padding: 12px; font-weight: bold; border-bottom: 1px solid #e5e7eb;">Date & Time</td>
                <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">${formattedDate}</td>
              </tr>
              <tr>
                <td style="padding: 12px; font-weight: bold; border-bottom: 1px solid #e5e7eb;">Duration</td>
                <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">${duration} minutes</td>
              </tr>
              ${meetLink ? `
              <tr>
                <td style="padding: 12px; font-weight: bold; border-bottom: 1px solid #e5e7eb;">Google Meet Link</td>
                <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;"><a href="${meetLink}" style="color: #6366f1; font-weight: bold;">Join Meeting</a></td>
              </tr>
              ` : ''}
              ${projectDescription ? `
              <tr>
                <td style="padding: 12px; font-weight: bold;">Project Details</td>
                <td style="padding: 12px;">${projectDescription}</td>
              </tr>
              ` : ''}
            </table>
            <p>If you need to reschedule or cancel, please log in to your portal.</p>
            <p>Best regards,<br/>The Hylith Team</p>
          </div>
        `,
      });

      await this.sendBrevoEmail(brevoApiKey, {
        to: emails.map((e) => ({ email: e })),
        subject: `New Lead Booking: ${name}`,
        htmlContent: `
          <div style="font-family: Arial, sans-serif; color: #333;">
            <h2>New Booking Received</h2>
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Date/Time:</strong> ${formattedDate}</p>
            <p><strong>Meet Link:</strong> <a href="${meetLink}">Join</a></p>
            <p><strong>Project Description:</strong> ${projectDescription || 'None'}</p>
          </div>
        `,
      });

      await this.eventBus.publish('email.sent', {
        meetingId: job.data.meetingId,
        type: 'confirmation',
        recipient: email,
      });
    } else if (
      job.name === 'send-cancellation' ||
      job.name === 'send-cancellation-by-id'
    ) {
      this.logger.log(`Dispatching meeting cancellation notification to ${email}...`);
      await this.sendBrevoEmail(brevoApiKey, {
        to: [{ email, name }],
        subject: `Discovery Meeting Cancelled - Hylith`,
        htmlContent: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
            <h2 style="color: #ef4444;">Meeting Cancelled</h2>
            <p>Hi ${name},</p>
            <p>Your discovery call scheduled for <strong>${formattedDate}</strong> has been cancelled.</p>
            <p>If you did not request this or would like to book a new slot, please visit the portal.</p>
            <p>Best regards,<br/>The Hylith Team</p>
          </div>
        `,
      });

      await this.sendBrevoEmail(brevoApiKey, {
        to: emails.map((e) => ({ email: e })),
        subject: `Cancelled Lead Booking: ${name}`,
        htmlContent: `
          <div style="font-family: Arial, sans-serif; color: #333;">
            <h2>Booking Cancelled</h2>
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Original Date/Time:</strong> ${formattedDate}</p>
          </div>
        `,
      });

      await this.eventBus.publish('email.sent', {
        meetingId: job.data.meetingId,
        type: 'cancellation',
        recipient: email,
      });
    }
  }

  private async sendBrevoEmail(
    apiKey: string,
    payload: {
      to: { email: string; name?: string }[];
      subject: string;
      htmlContent: string;
    },
  ) {
    const response = await this.resilienceService
      .getBreaker('brevo-email')
      .execute(() =>
        fetch('https://api.brevo.com/v3/smtp/email', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'api-key': apiKey,
          },
          body: JSON.stringify({
            sender: { name: 'Hylith Scheduling', email: 'no-reply@hylith.com' },
            to: payload.to,
            subject: payload.subject,
            htmlContent: payload.htmlContent,
          }),
        }),
      );

    if (!response.ok) {
      const errorText = await response.text();
      this.logger.error(`Failed to send email via Brevo: ${errorText}`);
      throw new Error(`Brevo HTTP dispatch failed: ${response.statusText}`);
    }
  }
}
