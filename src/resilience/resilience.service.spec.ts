import { Test, TestingModule } from '@nestjs/testing';
import { ResilienceService } from './resilience.service';
import { RequestShedderGuard } from './request-shedder.guard';
import { RedisService } from '../redis/redis.service';
import { CircuitBreaker } from './circuit-breaker';
import { ExecutionContext, HttpException, HttpStatus } from '@nestjs/common';

describe('Hylith SRE Resilience System', () => {
  let resilienceService: ResilienceService;
  
  const mockRedisService = {
    get: jest.fn().mockResolvedValue('ok'),
    set: jest.fn().mockResolvedValue(true),
    getClient: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ResilienceService,
        {
          provide: RedisService,
          useValue: mockRedisService,
        },
      ],
    }).compile();

    resilienceService = module.get<ResilienceService>(ResilienceService);
    // Initialize the service and clean forced modes
    resilienceService.onModuleInit();
    resilienceService.forceMode(null);
  });

  afterEach(() => {
    resilienceService.onModuleDestroy();
  });

  describe('1. Circuit Breaker State Machine', () => {
    it('should start in CLOSED state and successfully execute operations', async () => {
      const breaker = new CircuitBreaker('test-breaker', 3, 1000, 2);
      expect(breaker.getState()).toBe('CLOSED');

      const result = await breaker.execute(async () => 'success');
      expect(result).toBe('success');
      expect(breaker.getState()).toBe('CLOSED');
    });

    it('should transition to OPEN after 3 consecutive failures', async () => {
      const breaker = new CircuitBreaker('test-breaker', 3, 1000, 2);
      
      const failingOp = () => Promise.reject(new Error('API Error'));

      // 1st Failure
      await expect(breaker.execute(failingOp)).rejects.toThrow('API Error');
      expect(breaker.getState()).toBe('CLOSED');

      // 2nd Failure
      await expect(breaker.execute(failingOp)).rejects.toThrow('API Error');
      expect(breaker.getState()).toBe('CLOSED');

      // 3rd Failure -> Trips Circuit
      await expect(breaker.execute(failingOp)).rejects.toThrow('API Error');
      expect(breaker.getState()).toBe('OPEN');

      // 4th Attempt -> Denied instantly
      await expect(breaker.execute(async () => 'should not run')).rejects.toThrow(
        "Circuit breaker 'test-breaker' is OPEN. Request rejected."
      );
    });

    it('should fall back to cool-down bypass when fallback is provided in OPEN state', async () => {
      const breaker = new CircuitBreaker('test-breaker', 1, 1000, 1);
      
      await expect(breaker.execute(() => Promise.reject(new Error('Fail')))).rejects.toThrow('Fail');
      expect(breaker.getState()).toBe('OPEN');

      const fallbackResult = await breaker.execute(
        () => Promise.resolve('main'),
        () => Promise.resolve('fallback')
      );
      expect(fallbackResult).toBe('fallback');
    });
  });

  describe('2. Request Shedder Ingress Guard', () => {
    let guard: RequestShedderGuard;

    beforeEach(() => {
      guard = new RequestShedderGuard(resilienceService);
    });

    it('should allow all requests under NORMAL operational mode', () => {
      resilienceService.forceMode('NORMAL');
      
      const mockContext = createMockExecutionContext('/api/v1/meetings/admin', 'GET');
      expect(guard.canActivate(mockContext)).toBe(true);
    });

    it('should shed non-critical Class B requests under DEGRADED mode', () => {
      resilienceService.forceMode('DEGRADED');

      const mockContextClassB = createMockExecutionContext('/api/v1/meetings/admin', 'GET');
      expect(() => guard.canActivate(mockContextClassB)).toThrow(
        new HttpException(
          'System is running under high load. Non-critical features are temporarily disabled.',
          HttpStatus.SERVICE_UNAVAILABLE
        )
      );
    });

    it('should strictly allow Class A critical booking creations under DEGRADED/EMERGENCY modes', () => {
      resilienceService.forceMode('EMERGENCY');

      const mockContextClassA = createMockExecutionContext('/api/v1/meetings', 'POST');
      expect(guard.canActivate(mockContextClassA)).toBe(true);
      
      const mockContextLogin = createMockExecutionContext('/api/v1/auth/login', 'POST');
      expect(guard.canActivate(mockContextLogin)).toBe(true);
    });
  });
});

function createMockExecutionContext(path: string, method: string): ExecutionContext {
  const request = {
    path,
    method,
    ip: '127.0.0.1',
    socket: {},
  };

  return {
    switchToHttp: () => ({
      getRequest: () => request,
      getResponse: () => ({
        setHeader: jest.fn(),
      }),
    }),
    getType: () => 'http',
  } as unknown as ExecutionContext;
}
