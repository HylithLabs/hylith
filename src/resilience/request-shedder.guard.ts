import {
  Injectable,
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { ResilienceService } from './resilience.service';
import { Request } from 'express';

@Injectable()
export class RequestShedderGuard implements CanActivate {
  private readonly logger = new Logger(RequestShedderGuard.name);

  constructor(private readonly resilienceService: ResilienceService) {}

  canActivate(context: ExecutionContext): boolean {
    const mode = this.resilienceService.getMode();
    
    // Normal operation requires no shedding
    if (mode === 'NORMAL') {
      return true;
    }

    const request = context.switchToHttp().getRequest<Request>();
    const path = request.path;
    const method = request.method;

    // 1. Define Class A (Critical Operations) - MUST NOT be shed
    const isClassA =
      (path.includes('/auth/login') && method === 'POST') ||
      (path.includes('/auth/refresh') && method === 'POST') ||
      (path.includes('/meetings') && method === 'POST') ||
      path.includes('.well-known/jwks.json') ||
      path === '/' || // health check probe
      path === '/api/v1';

    // 2. Under DEGRADED mode: Shed Class B, allow Class A
    if (mode === 'DEGRADED') {
      if (!isClassA) {
        this.logger.warn(`Shedding non-critical request under DEGRADED mode: ${method} ${path}`);
        throw new HttpException(
          {
            statusCode: HttpStatus.SERVICE_UNAVAILABLE,
            message: 'System is running under high load. Non-critical features are temporarily disabled.',
            retryAfter: 30,
          },
          HttpStatus.SERVICE_UNAVAILABLE,
        );
      }
    }

    // 3. Under EMERGENCY mode: Shed aggressively
    if (mode === 'EMERGENCY') {
      if (!isClassA) {
        this.logger.error(`Shedding non-critical request under EMERGENCY mode: ${method} ${path}`);
        throw new HttpException(
          {
            statusCode: HttpStatus.SERVICE_UNAVAILABLE,
            message: 'System is under emergency recovery. Please try again in a few minutes.',
            retryAfter: 60,
          },
          HttpStatus.SERVICE_UNAVAILABLE,
        );
      }
    }

    return true;
  }
}
