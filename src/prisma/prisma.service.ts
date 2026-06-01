import { Injectable, OnModuleInit, OnModuleDestroy, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { ResilienceService } from '../resilience/resilience.service';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  constructor(private readonly resilienceService: ResilienceService) {
    super();
  }

  async onModuleInit() {
    await this.$connect();
    
    // Register the emergency write-blocking middleware
    this.$use(async (params, next) => {
      const mode = this.resilienceService.getMode();
      
      if (mode === 'EMERGENCY') {
        const mutatingActions = [
          'create', 'update', 'delete', 'upsert', 
          'createMany', 'updateMany', 'deleteMany'
        ];

        if (mutatingActions.includes(params.action)) {
          // Exclude Class A operations (core meeting creation and audit logging)
          const isClassA = 
            (params.model === 'Meeting' && params.action === 'create') ||
            params.model === 'AuditLog';

          if (!isClassA) {
            this.logger.error(`EMERGENCY: Database write blocked on model ${params.model} (${params.action})`);
            throw new HttpException(
              {
                statusCode: HttpStatus.SERVICE_UNAVAILABLE,
                message: 'Database is in emergency read-only recovery. Modification blocked.',
                model: params.model,
                action: params.action,
              },
              HttpStatus.SERVICE_UNAVAILABLE,
            );
          }
        }
      }
      
      return next(params);
    });
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}

