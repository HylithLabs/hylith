import { Injectable } from '@nestjs/common';
import { RealtimeGateway } from '../../realtime/realtime.gateway';
import { DomainEvent } from '../events.types';

@Injectable()
export class WebsocketEventConsumer {
  constructor(private readonly realtimeGateway: RealtimeGateway) {}

  async handle(event: DomainEvent): Promise<void> {
    const payload = event.payload as Record<string, unknown>;

    switch (event.name) {
      case 'meeting.created':
      case 'meeting.updated':
      case 'meeting.cancelled':
      case 'calendar.synced':
      case 'email.sent': {
        if (payload.clientId && typeof payload.clientId === 'string') {
          await this.realtimeGateway.emitToUser(
            payload.clientId,
            event.name,
            payload,
            event.id,
          );
        }
        if (payload.meetingId && typeof payload.meetingId === 'string') {
          await this.realtimeGateway.emitToMeeting(
            payload.meetingId,
            event.name,
            payload,
            event.id,
          );
        }
        await this.realtimeGateway.emitToAdmins(event.name, payload, event.id);
        return;
      }
      case 'availability.updated':
        await this.realtimeGateway.emitToAvailability(
          event.name,
          payload,
          event.id,
        );
        return;
      case 'user.session.created': {
        const userId = payload.userId as string;
        if (userId) {
          await this.realtimeGateway.emitToUser(userId, event.name, payload, event.id);
        }
        return;
      }
      default:
        return;
    }
  }
}
