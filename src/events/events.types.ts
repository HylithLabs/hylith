export type DomainEventName =
  | 'meeting.created'
  | 'meeting.updated'
  | 'meeting.cancelled'
  | 'availability.updated'
  | 'user.session.created'
  | 'email.sent'
  | 'calendar.synced';

type EventPayloadMap = {
  'meeting.created': {
    meetingId: string;
    clientId?: string | null;
    clientEmail: string;
    meetingDate: string;
    duration: number;
  };
  'meeting.updated': {
    meetingId: string;
    status: string;
    actorUserId?: string;
  };
  'meeting.cancelled': {
    meetingId: string;
    actorUserId?: string;
  };
  'availability.updated': {
    userId: string;
    availableDays: number[];
    meetingDuration: number;
    leadTime: number;
  };
  'user.session.created': {
    userId: string;
    sessionId: string;
    ipAddress?: string;
    deviceInfo?: string;
  };
  'email.sent': {
    meetingId?: string;
    type: 'confirmation' | 'cancellation';
    recipient: string;
  };
  'calendar.synced': {
    meetingId: string;
    action: 'create' | 'cancel';
    status: 'CONFIRMED' | 'CANCELLED';
    meetLink?: string | null;
  };
};

export type DomainEvent<T extends DomainEventName = DomainEventName> = {
  id: string;
  occurredAt: string;
  source: string;
  name: T;
  payload: EventPayloadMap[T];
};

export type DomainEventPayload<T extends DomainEventName> = EventPayloadMap[T];
