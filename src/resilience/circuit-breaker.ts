import { Logger } from '@nestjs/common';

export type CircuitState = 'CLOSED' | 'OPEN' | 'HALF_OPEN';

export class CircuitBreaker {
  private readonly logger = new Logger(CircuitBreaker.name);
  private state: CircuitState = 'CLOSED';
  private failures = 0;
  private successCount = 0;
  private nextAttemptAt = 0;

  constructor(
    public readonly name: string,
    private readonly failureThreshold = 3,       // Number of consecutive failures to open circuit
    private readonly openMs = 15000,             // Cooldown period in ms before test probe
    private readonly halfOpenSuccessLimit = 2,  // Successful attempts in HALF_OPEN to close circuit
  ) {}

  getState(): CircuitState {
    const now = Date.now();
    if (this.state === 'OPEN' && now >= this.nextAttemptAt) {
      this.transitionTo('HALF_OPEN');
    }
    return this.state;
  }

  async execute<T>(operation: () => Promise<T>, fallback?: () => Promise<T>): Promise<T> {
    const currentState = this.getState();

    if (currentState === 'OPEN') {
      if (fallback) {
        this.logger.debug(`Circuit ${this.name} is OPEN. Executing fallback.`);
        return fallback();
      }
      throw new Error(`Circuit breaker '${this.name}' is OPEN. Request rejected.`);
    }

    try {
      const result = await operation();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure(error as Error);
      if (fallback) {
        this.logger.debug(`Circuit ${this.name} execution failed. Executing fallback.`);
        return fallback();
      }
      throw error;
    }
  }

  private onSuccess() {
    if (this.state === 'HALF_OPEN') {
      this.successCount++;
      this.logger.log(`Circuit ${this.name} probe success (${this.successCount}/${this.halfOpenSuccessLimit})`);
      if (this.successCount >= this.halfOpenSuccessLimit) {
        this.transitionTo('CLOSED');
      }
    } else {
      this.failures = 0;
    }
  }

  private onFailure(error: Error) {
    this.failures++;
    this.logger.warn(`Circuit ${this.name} registered failure (${this.failures}/${this.failureThreshold}): ${error.message}`);
    
    if (this.state === 'CLOSED') {
      if (this.failures >= this.failureThreshold) {
        this.transitionTo('OPEN');
      }
    } else if (this.state === 'HALF_OPEN') {
      // Any failure in HALF_OPEN instantly trips the circuit back to OPEN
      this.transitionTo('OPEN');
    }
  }

  private transitionTo(newState: CircuitState) {
    const oldState = this.state;
    this.state = newState;
    
    if (newState === 'OPEN') {
      this.nextAttemptAt = Date.now() + this.openMs;
      this.successCount = 0;
      this.logger.error(`🚨 Circuit ${this.name} tripped from ${oldState} to OPEN. Cool-off until: ${new Date(this.nextAttemptAt).toISOString()}`);
    } else if (newState === 'HALF_OPEN') {
      this.successCount = 0;
      this.logger.warn(`⚠️ Circuit ${this.name} entering HALF_OPEN probe state. Testing connection...`);
    } else if (newState === 'CLOSED') {
      this.failures = 0;
      this.successCount = 0;
      this.logger.log(`✅ Circuit ${this.name} recovered from ${oldState} to CLOSED. Resuming normal operations.`);
    }
  }
}

