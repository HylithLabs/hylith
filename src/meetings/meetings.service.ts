import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CacheService } from '../cache/cache.service';
import { CACHE_KEYS, CACHE_TTL_SECONDS } from '../cache/cache.constants';
import { EventBusService } from '../events/event-bus.service';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MeetingsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly eventBus: EventBusService,
    private readonly cacheService: CacheService,
  ) {}

  async createBooking(data: {
    clientId?: string;
    clientName: string;
    clientEmail: string;
    meetingDate: string;
    duration?: number;
    projectDescription?: string;
  }) {
    const meetingDate = new Date(data.meetingDate);
    const duration = data.duration || 30;

    const startRange = new Date(meetingDate);
    const endRange = new Date(meetingDate.getTime() + duration * 60000);

    const conflictingMeeting = await this.prisma.meeting.findFirst({
      where: {
        meetingDate: {
          gte: new Date(startRange.getTime() - duration * 60000),
          lte: endRange,
        },
        status: {
          not: 'CANCELLED',
        },
        deletedAt: null,
      },
    });

    if (conflictingMeeting) {
      throw new BadRequestException(
        'The selected slot has already been booked by another client',
      );
    }

    const meeting = await this.prisma.meeting.create({
      data: {
        clientId: data.clientId || null,
        clientName: data.clientName,
        clientEmail: data.clientEmail,
        meetingDate,
        duration,
        projectDescription: data.projectDescription || null,
        status: 'PENDING',
      },
    });

    await this.eventBus.publish('meeting.created', {
      meetingId: meeting.id,
      clientId: meeting.clientId,
      clientEmail: meeting.clientEmail,
      meetingDate: meeting.meetingDate.toISOString(),
      duration: meeting.duration,
    });

    return meeting;
  }

  async getClientBookings(clientId: string) {
    return this.prisma.meeting.findMany({
      where: {
        clientId,
        deletedAt: null,
      },
      orderBy: {
        meetingDate: 'asc',
      },
    });
  }

  async getAllBookings() {
    return this.cacheService.getSWR(
      CACHE_KEYS.meetingsAdmin(),
      CACHE_TTL_SECONDS.meetingsAdminList,
      CACHE_TTL_SECONDS.swrSoft,
      async () =>
        this.prisma.meeting.findMany({
          where: {
            deletedAt: null,
          },
          orderBy: {
            meetingDate: 'asc',
          },
        }),
    );
  }

  async changeMeetingStatus(
    id: string,
    status: 'CONFIRMED' | 'COMPLETED' | 'CANCELLED',
  ) {
    const meeting = await this.prisma.meeting.findUnique({ where: { id } });

    if (!meeting) {
      throw new NotFoundException(`Meeting ${id} not found`);
    }

    const updated = await this.prisma.meeting.update({
      where: { id },
      data: { status },
    });

    if (status === 'CANCELLED') {
      await this.eventBus.publish('meeting.cancelled', {
        meetingId: id,
      });
    } else {
      await this.eventBus.publish('meeting.updated', {
        meetingId: id,
        status,
      });
    }

    return updated;
  }
}
