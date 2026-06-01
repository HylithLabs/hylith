import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { APP_GUARD } from '@nestjs/core';
import { AuthService } from './auth.service';
import { AuthController, JwksController } from './auth.controller';
import { KeysService } from './keys.service';
import { SessionsModule } from '../sessions/sessions.module';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { PermissionsGuard } from './guards/permissions.guard';

@Module({
  imports: [
    SessionsModule,
    JwtModule.register({}),
  ],
  controllers: [AuthController, JwksController],
  providers: [
    AuthService,
    KeysService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: PermissionsGuard,
    },
  ],
  exports: [AuthService, KeysService],
})
export class AuthModule {}
