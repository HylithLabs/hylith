import { Injectable } from '@nestjs/common';
import { CacheService } from '../cache/cache.service';
import { CACHE_KEYS, CACHE_TTL_SECONDS } from '../cache/cache.constants';
import { EventBusService } from '../events/event-bus.service';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AvailabilityService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cacheService: CacheService,
    private readonly eventBus: EventBusService,
  ) {}

  async getAvailableSlots(dateString: string): Promise<string[]> {
    const cacheKey = CACHE_KEYS.availabilitySlots(dateString);
    return this.cacheService.getOrSet(
      cacheKey,
      CACHE_TTL_SECONDS.availabilitySlots,
      async () => this.computeAvailableSlots(dateString),
    );
  }

  private async computeAvailableSlots(dateString: string): Promise<string[]> {
    let settings = await this.prisma.availability.findFirst();

    if (!settings) {
      settings = {
        id: 'default',
        userId: 'system',
        availableDays: [1, 2, 3, 4, 5],
        timeSlots: [{ start: '09:00', end: '17:00' }] as any,
        meetingDuration: 30,
        leadTime: 24,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    }

    const requestedDate = new Date(dateString);
    const dayOfWeek = requestedDate.getUTCDay();

    if (!settings.availableDays.includes(dayOfWeek)) {
      return [];
    }

    const startOfDay = new Date(dateString);
    startOfDay.setUTCHours(0, 0, 0, 0);

    const endOfDay = new Date(dateString);
    endOfDay.setUTCHours(23, 59, 59, 999);

    const existingMeetings = await this.prisma.meeting.findMany({
      where: {
        meetingDate: {
          gte: startOfDay,
          lte: endOfDay,
        },
        status: {
          not: 'CANCELLED',
        },
        deletedAt: null,
      },
    });

    const slots: string[] = [];
    const meetingDurationMs = settings.meetingDuration * 60 * 1000;
    const leadTimeMs = settings.leadTime * 60 * 60 * 1000;
    const now = new Date();

    const timeRanges = settings.timeSlots as Array<{ start: string; end: string }>;

    for (const range of timeRanges) {
      const [startHour, startMin] = range.start.split(':').map(Number);
      const [endHour, endMin] = range.end.split(':').map(Number);

      const slotStart = new Date(dateString);
      slotStart.setUTCHours(startHour, startMin, 0, 0);

      const slotEndLimit = new Date(dateString);
      slotEndLimit.setUTCHours(endHour, endMin, 0, 0);

      let currentSlot = new Date(slotStart);

      while (
        currentSlot.getTime() + meetingDurationMs <=
        slotEndLimit.getTime()
      ) {
        const slotTime = currentSlot.getTime();

        if (slotTime > now.getTime() + leadTimeMs) {
          const hasConflict = existingMeetings.some((m) => {
            const meetingStart = new Date(m.meetingDate).getTime();
            const meetingEnd = meetingStart + m.duration * 60 * 1000;
            return slotTime < meetingEnd && slotTime + meetingDurationMs > meetingStart;
          });

          if (!hasConflict) {
            const hours = String(currentSlot.getUTCHours()).padStart(2, '0');
            const mins = String(currentSlot.getUTCMinutes()).padStart(2, '0');
            slots.push(`${hours}:${mins}`);
          }
        }

        currentSlot = new Date(currentSlot.getTime() + meetingDurationMs);
      }
    }

    return slots;
  }

  async updateSettings(
    userId: string,
    data: {
      availableDays: number[];
      timeSlots: any[];
      meetingDuration: number;
      leadTime: number;
    },
  ) {
    const updated = await this.prisma.availability.upsert({
      where: { userId },
      update: {
        availableDays: data.availableDays,
        timeSlots: data.timeSlots,
        meetingDuration: data.meetingDuration,
        leadTime: data.leadTime,
      },
      create: {
        userId,
        availableDays: data.availableDays,
        timeSlots: data.timeSlots,
        meetingDuration: data.meetingDuration,
        leadTime: data.leadTime,
      },
    });

    await this.eventBus.publish('availability.updated', {
      userId,
      availableDays: updated.availableDays,
      meetingDuration: updated.meetingDuration,
      leadTime: updated.leadTime,
    });

    return updated;
  }
}
