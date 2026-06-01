import { Module } from '@nestjs/common';
import { StructuredLogger } from './structured-logger';

@Module({
  providers: [StructuredLogger],
  exports: [StructuredLogger],
})
export class ObservabilityModule {}
