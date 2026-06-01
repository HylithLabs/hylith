import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';

import { StructuredLogger } from './observability/structured-logger';

async function bootstrap() {
  const logger = new StructuredLogger();
  const app = await NestFactory.create(AppModule, { logger });

  // Security Headers
  app.use(helmet());

  // Cookie Parsing for secure session tokens
  app.use(cookieParser());

  // Global DTO input validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  // CORS configured for Next.js credentials-supported requests
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  });

  // Gateway routing prefix
  app.setGlobalPrefix('api/v1', {
    exclude: ['.well-known/jwks.json'],
  });

  const port = process.env.PORT || 4000;
  await app.listen(port);
  console.log(`🚀 NestJS Backend running at http://localhost:${port}/api/v1`);
}
bootstrap();

