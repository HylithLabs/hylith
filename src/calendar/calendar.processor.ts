import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Job } from 'bullmq';
import { google } from 'googleapis';
import { EventBusService } from '../events/event-bus.service';
import { PrismaService } from '../prisma/prisma.service';
import { ResilienceService } from '../resilience/resilience.service';

@Processor('calendar-queue', { concurrency: 20 })
@Injectable()
export class CalendarProcessor extends WorkerHost {
  private readonly logger = new Logger(CalendarProcessor.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
    private readonly eventBus: EventBusService,
    private readonly resilienceService: ResilienceService,
  ) {
    super();
  }

  async process(job: Job<any, any, string>): Promise<any> {
    const clientId = this.configService.get<string>('CALENDAR_GOOGLE_CLIENT_ID');
    const clientSecret = this.configService.get<string>(
      'CALENDAR_GOOGLE_CLIENT_SECRET',
    );
    const refreshToken = this.configService.get<string>(
      'CALENDAR_GOOGLE_REFRESH_TOKEN',
    );

    if (!clientId || !clientSecret || !refreshToken) {
      this.logger.error('Google Calendar credentials are not configured!');
      throw new Error('Google Calendar config missing');
    }

    const oauth2Client = new google.auth.OAuth2(
      clientId,
      clientSecret,
      'http://localhost:3000',
    );
    oauth2Client.setCredentials({ refresh_token: refreshToken });
    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

    const { meetingId } = job.data;
    const meeting = await this.prisma.meeting.findUnique({
      where: { id: meetingId },
    });

    if (!meeting) {
      this.logger.warn(`Meeting ${meetingId} not found in DB, skipping job.`);
      return;
    }

    if (job.name === 'create-event') {
      this.logger.log(`Creating Google Calendar event for meeting ${meetingId}...`);

      const start = new Date(meeting.meetingDate);
      const end = new Date(start.getTime() + meeting.duration * 60000);

      try {
        const eventResponse = await this.resilienceService
          .getBreaker('google-calendar')
          .execute(() =>
            calendar.events.insert({
              calendarId: 'primary',
              conferenceDataVersion: 1,
              requestBody: {
                summary: `Discovery Call - ${meeting.clientName}`,
                description: meeting.projectDescription || 'No details provided.',
                start: { dateTime: start.toISOString() },
                end: { dateTime: end.toISOString() },
                attendees: [{ email: meeting.clientEmail }],
                conferenceData: {
                  createRequest: {
                    requestId: `meet-${meeting.id}`,
                    conferenceSolutionKey: { type: 'hangoutsMeet' },
                  },
                },
              },
            }),
          );

        const googleEventId = eventResponse.data.id || null;
        const meetLink =
          eventResponse.data.conferenceData?.entryPoints?.[0]?.uri || null;

        const updatedMeeting = await this.prisma.meeting.update({
          where: { id: meeting.id },
          data: {
            googleEventId,
            meetLink,
            status: 'CONFIRMED',
          },
        });

        this.logger.log(
          `Google Calendar event created successfully. EventID: ${googleEventId}, Meet: ${meetLink}`,
        );

        await this.eventBus.publish('calendar.synced', {
          meetingId: updatedMeeting.id,
          action: 'create',
          status: 'CONFIRMED',
          meetLink: updatedMeeting.meetLink,
        });
        await this.eventBus.publish('meeting.updated', {
          meetingId: updatedMeeting.id,
          status: 'CONFIRMED',
        });
      } catch (err) {
        this.logger.error(`Failed to insert calendar event: ${err.message}`);
        throw err;
      }
    } else if (job.name === 'cancel-event') {
      if (!meeting.googleEventId) {
        this.logger.warn(
          `Meeting ${meetingId} has no googleEventId, skipping API delete.`,
        );
        await this.eventBus.publish('calendar.synced', {
          meetingId: meeting.id,
          action: 'cancel',
          status: 'CANCELLED',
          meetLink: null,
        });
        return;
      }

      this.logger.log(
        `Deleting Google Calendar event ${meeting.googleEventId} for meeting ${meetingId}...`,
      );
      try {
        await this.resilienceService
          .getBreaker('google-calendar')
          .execute(() =>
            calendar.events.delete({
              calendarId: 'primary',
              eventId: meeting.googleEventId!,
            }),
          );

        await this.prisma.meeting.update({
          where: { id: meeting.id },
          data: {
            googleEventId: null,
            meetLink: null,
            status: 'CANCELLED',
          },
        });

        this.logger.log(
          `Google Calendar event ${meeting.googleEventId} deleted successfully.`,
        );
      } catch (err) {
        if (err.code === 410 || err.code === 404) {
          this.logger.warn(`Event already deleted or missing on Google Calendar side.`);
        } else {
          this.logger.error(`Failed to delete calendar event: ${err.message}`);
          throw err;
        }
      }

      await this.eventBus.publish('calendar.synced', {
        meetingId: meeting.id,
        action: 'cancel',
        status: 'CANCELLED',
        meetLink: null,
      });
    }
  }
}
