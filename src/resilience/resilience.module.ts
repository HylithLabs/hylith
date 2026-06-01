import { Global, Module } from '@nestjs/common';
import { ResilienceService } from './resilience.service';
import { RateLimiterGuard } from './rate-limiter.guard';
import { RequestShedderGuard } from './request-shedder.guard';
import { ResilienceController } from './resilience.controller';

@Global()
@Module({
  controllers: [ResilienceController],
  providers: [ResilienceService, RateLimiterGuard, RequestShedderGuard],
  exports: [ResilienceService, RateLimiterGuard, RequestShedderGuard],
})
export class ResilienceModule {}


