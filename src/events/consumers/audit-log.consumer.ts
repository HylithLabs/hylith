import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { DomainEvent } from '../events.types';

@Injectable()
export class AuditLogConsumer {
  constructor(private readonly prisma: PrismaService) {}

  async handle(event: DomainEvent): Promise<void> {
    const payload = event.payload as Record<string, unknown>;

    await this.prisma.auditLog.create({
      data: {
        userId: (payload.actorUserId as string) || (payload.userId as string) || null,
        action: event.name,
        entityId: (payload.meetingId as string) || null,
        entityType: event.name.startsWith('meeting')
          ? 'MEETING'
          : event.name.startsWith('availability')
            ? 'AVAILABILITY'
            : 'SYSTEM',
        newValue: payload as any,
      },
    });
  }
}
