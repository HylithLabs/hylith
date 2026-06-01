import { Injectable } from '@nestjs/common';
import { CacheService } from '../../cache/cache.service';
import { DomainEvent } from '../events.types';

@Injectable()
export class CacheInvalidationConsumer {
  constructor(private readonly cacheService: CacheService) {}

  async handle(event: DomainEvent): Promise<void> {
    switch (event.name) {
      case 'meeting.created':
      case 'meeting.updated':
      case 'meeting.cancelled':
      case 'calendar.synced':
        await this.cacheService.del('cache:meetings:admin');
        await this.cacheService.deleteByPrefix('cache:availability:');
        return;
      case 'availability.updated':
        await this.cacheService.deleteByPrefix('cache:availability:');
        return;
      case 'user.session.created':
        await this.cacheService.deleteByPrefix(
          `cache:user:permissions:${(event.payload as any).userId}`,
        );
        return;
      default:
        return;
    }
  }
}
