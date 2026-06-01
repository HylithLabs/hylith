import { Module } from '@nestjs/common';
import { RealtimeGateway } from './realtime.gateway';
import { RealtimeService } from './realtime.service';
import { RealtimeConsumer } from './realtime.consumer';
import { AuthModule } from '../auth/auth.module';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    AuthModule,
    JwtModule,
  ],
  providers: [RealtimeGateway, RealtimeService, RealtimeConsumer],
  exports: [RealtimeService, RealtimeGateway],
})
export class RealtimeModule {}
