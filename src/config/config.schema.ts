import { plainToInstance } from 'class-transformer';
import { IsNumber, IsOptional, IsString, validateSync } from 'class-validator';

export class EnvironmentVariables {
  @IsNumber()
  @IsOptional()
  PORT?: number = 4000;

  @IsString()
  DATABASE_URL: string;

  @IsString()
  DIRECT_URL: string;

  @IsString()
  JWT_SECRET: string;

  @IsString()
  FRONTEND_URL: string;

  @IsString()
  REDIS_URL: string;

  @IsString()
  SUPABASE_JWT_SECRET: string;

  @IsString()
  BREVO_API_KEY: string;

  @IsString()
  AGENCY_NOTIFICATION_EMAIL: string;

  @IsString()
  CALENDAR_GOOGLE_CLIENT_ID: string;

  @IsString()
  CALENDAR_GOOGLE_CLIENT_SECRET: string;

  @IsString()
  CALENDAR_GOOGLE_REFRESH_TOKEN: string;

  @IsString()
  AGENCY_TIMEZONE: string = 'Asia/Dhaka';
}

export function config(values: Record<string, unknown>) {
  const validatedConfig = plainToInstance(EnvironmentVariables, values, {
    enableImplicitConversion: true,
  });
  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    throw new Error(`Config validation error: ${errors.toString()}`);
  }
  return validatedConfig;
}
