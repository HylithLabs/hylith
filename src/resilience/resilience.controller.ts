import { Controller, Get, Post, Body, HttpException, HttpStatus, Logger, UseGuards } from '@nestjs/common';
import { ResilienceService, SystemMode } from './resilience.service';

@Controller('resilience')
export class ResilienceController {
  private readonly logger = new Logger(ResilienceController.name);

  constructor(private readonly resilienceService: ResilienceService) {}

  @Get('status')
  getStatus() {
    return {
      success: true,
      timestamp: new Date().toISOString(),
      metrics: this.resilienceService.getMetrics(),
    };
  }

  @Post('force-mode')
  forceMode(@Body() body: { mode: SystemMode | 'AUTO' }) {
    if (!body || !body.mode) {
      throw new HttpException('Mode is required in the body', HttpStatus.BAD_REQUEST);
    }

    const targetMode = body.mode === 'AUTO' ? null : body.mode;
    this.resilienceService.forceMode(targetMode);
    
    return {
      success: true,
      message: `System operational override set to: ${body.mode}`,
      currentMetrics: this.resilienceService.getMetrics(),
    };
  }

  @Post('trigger-chaos')
  triggerChaos(@Body() body: { type: 'google-outage' | 'brevo-outage' | 'redis-slowdown' | 'clear' }) {
    if (!body || !body.type) {
      throw new HttpException('Chaos type is required', HttpStatus.BAD_REQUEST);
    }

    this.logger.warn(`🔥 SRE CHAOS SIMULATION INITIATED: ${body.type}`);

    switch (body.type) {
      case 'google-outage': {
        const breaker = this.resilienceService.getBreaker('google-calendar');
        // Artificially trip the breaker by executing failing dummy calls
        for (let i = 0; i < 4; i++) {
          void breaker.execute(() => Promise.reject(new Error('Simulated Google Calendar API 429 Storm'))).catch(() => {});
        }
        break;
      }
      case 'brevo-outage': {
        const breaker = this.resilienceService.getBreaker('brevo-email');
        for (let i = 0; i < 4; i++) {
          void breaker.execute(() => Promise.reject(new Error('Simulated Brevo SMTP Service Down'))).catch(() => {});
        }
        break;
      }
      case 'redis-slowdown': {
        // Force the system-wide mode directly to DEGRADED or EMERGENCY to simulate Redis/DB saturation
        this.resilienceService.forceMode('EMERGENCY');
        break;
      }
      case 'clear': {
        this.resilienceService.forceMode(null);
        // Force reset breakers
        const gcal = this.resilienceService.getBreaker('google-calendar');
        const brevo = this.resilienceService.getBreaker('brevo-email');
        // Reset by executing a successful operation
        void gcal.execute(() => Promise.resolve('ok')).catch(() => {});
        void brevo.execute(() => Promise.resolve('ok')).catch(() => {});
        break;
      }
      default:
        throw new HttpException(`Unknown chaos event type: ${body.type}`, HttpStatus.BAD_REQUEST);
    }

    return {
      success: true,
      message: `Chaos simulation scenario '${body.type}' applied.`,
      metrics: this.resilienceService.getMetrics(),
    };
  }
}
