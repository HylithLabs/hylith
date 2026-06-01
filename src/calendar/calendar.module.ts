import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { EventsModule } from '../events/events.module';
import { CalendarProcessor } from './calendar.processor';
import { CalendarService } from './calendar.service';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'calendar-queue',
    }),
    EventsModule,
  ],
  providers: [CalendarService, CalendarProcessor],
  exports: [CalendarService],
})
export class CalendarModule {}
