import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { CircuitBreaker, CircuitState } from './circuit-breaker';
import { RedisService } from '../redis/redis.service';

export type SystemMode = 'NORMAL' | 'DEGRADED' | 'EMERGENCY';

@Injectable()
export class ResilienceService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(ResilienceService.name);
  private readonly breakers = new Map<string, CircuitBreaker>();
  
  private currentMode: SystemMode = 'NORMAL';
  private monitorTimer?: NodeJS.Timeout;
  private lastLoopDelay = 0;
  private forcedMode: SystemMode | null = null; // Used for chaos simulator override

  constructor(private readonly redisService: RedisService) {}

  onModuleInit() {
    this.startMonitoring();
  }

  onModuleDestroy() {
    if (this.monitorTimer) {
      clearInterval(this.monitorTimer);
    }
  }

  getMode(): SystemMode {
    if (this.forcedMode) {
      return this.forcedMode;
    }
    return this.currentMode;
  }

  setMode(mode: SystemMode) {
    if (this.currentMode !== mode) {
      this.logger.warn(`⚠️ SYSTEM STATUS CHANGE: ${this.currentMode} ➔ ${mode}`);
      this.currentMode = mode;
    }
  }

  forceMode(mode: SystemMode | null) {
    this.forcedMode = mode;
    this.logger.warn(`🚨 SRE FORCE MODE OVERRIDE ACTIVATED: Mode set to ${mode || 'AUTO'}`);
  }

  getBreaker(name: string, failureThreshold = 3, openMs = 15000): CircuitBreaker {
    if (!this.breakers.has(name)) {
      this.breakers.set(name, new CircuitBreaker(name, failureThreshold, openMs));
    }
    return this.breakers.get(name)!;
  }

  getMetrics() {
    return {
      mode: this.getMode(),
      eventLoopDelayMs: this.lastLoopDelay,
      activeBreakers: Array.from(this.breakers.entries()).map(([name, breaker]) => ({
        name,
        state: breaker.getState(),
      })),
    };
  }

  private startMonitoring() {
    this.monitorTimer = setInterval(async () => {
      // 1. Measure Event Loop Latency
      const start = Date.now();
      setImmediate(() => {
        this.lastLoopDelay = Date.now() - start;
        this.evaluateSystemHealth();
      });
    }, 5000);
  }

  private async evaluateSystemHealth() {
    // Determine degraded/emergency transitions based on telemetry metrics
    let redisLatency = 0;
    try {
      const redisStart = Date.now();
      await this.redisService.get('sys:health:ping');
      redisLatency = Date.now() - redisStart;
    } catch (err) {
      redisLatency = 9999; // Redis timeout or connection down
    }

    let nextMode: SystemMode = 'NORMAL';

    if (this.lastLoopDelay > 150 || redisLatency > 200) {
      nextMode = 'EMERGENCY';
    } else if (this.lastLoopDelay > 80 || redisLatency > 50) {
      nextMode = 'DEGRADED';
    }

    if (nextMode !== this.currentMode && !this.forcedMode) {
      this.setMode(nextMode);
    }
  }
}

