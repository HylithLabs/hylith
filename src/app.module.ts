import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { AvailabilityModule } from './availability/availability.module';
import { CacheModule } from './cache/cache.module';
import { CalendarModule } from './calendar/calendar.module';
import { config } from './config/config.schema';
import { EmailModule } from './email/email.module';
import { EventsModule } from './events/events.module';
import { MeetingsModule } from './meetings/meetings.module';
import { ObservabilityModule } from './observability/observability.module';
import { PrismaModule } from './prisma/prisma.module';
import { RedisModule } from './redis/redis.module';
import { RealtimeModule } from './realtime/realtime.module';
import { ResilienceModule } from './resilience/resilience.module';
import { RequestShedderGuard } from './resilience/request-shedder.guard';
import { SessionsModule } from './sessions/sessions.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: config,
    }),
    ThrottlerModule.forRoot([
      { ttl: 1000, limit: 50 },
      { ttl: 60000, limit: 1200 },
    ]),
    PrismaModule,
    RedisModule,
    CacheModule,
    ResilienceModule,
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const redisUrl =
          configService.get<string>('REDIS_URL') || 'redis://localhost:6379';
        const url = new URL(redisUrl);
        return {
          connection: {
            host: url.hostname || 'localhost',
            port: parseInt(url.port || '6379', 10),
            username: url.username || undefined,
            password: url.password || undefined,
            maxRetriesPerRequest: null,
            retryStrategy: (times) => Math.min(times * 1000, 5000),
          },
        };
      },
      inject: [ConfigService],
    }),
    SessionsModule,
    AuthModule,
    EmailModule,
    CalendarModule,
    AvailabilityModule,
    MeetingsModule,
    ObservabilityModule,
    RealtimeModule,
    EventsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RequestShedderGuard,
    },
  ],
})
export class AppModule {}
