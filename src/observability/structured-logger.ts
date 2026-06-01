import { ConsoleLogger, Injectable, LogLevel } from '@nestjs/common';

@Injectable()
export class StructuredLogger extends ConsoleLogger {
  private isProduction = process.env.NODE_ENV === 'production';

  log(message: any, context?: string) {
    this.printStructured('log', message, context);
  }

  error(message: any, stack?: string, context?: string) {
    this.printStructured('error', message, context, stack);
  }

  warn(message: any, context?: string) {
    this.printStructured('warn', message, context);
  }

  debug(message: any, context?: string) {
    this.printStructured('debug', message, context);
  }

  verbose(message: any, context?: string) {
    this.printStructured('verbose', message, context);
  }

  private printStructured(level: LogLevel, message: any, context?: string, stack?: string) {
    if (this.isProduction) {
      const logObject = {
        timestamp: new Date().toISOString(),
        level,
        context: context || this.context || 'Application',
        message: typeof message === 'object' ? message : { text: message },
        ...(stack && { stack }),
      };
      console.log(JSON.stringify(logObject));
    } else {
      // In local development, use NestJS clean default console coloring formatting
      super[level](message, context || this.context);
      if (stack && level === 'error') {
        console.error(stack);
      }
    }
  }
}
