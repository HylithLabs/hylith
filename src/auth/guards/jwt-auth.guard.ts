import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { KeysService } from '../keys.service';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import type { Request } from 'express';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly jwtService: JwtService,
    private readonly keysService: KeysService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest<Request>();
    const token = this.extractToken(request);

    if (!token) {
      throw new UnauthorizedException('Access token is missing');
    }

    try {
      const payload = await this.jwtService.verifyAsync(token, {
        publicKey: this.keysService.getPublicKey(),
        algorithms: ['RS256'],
      });

      // Attach req.user with the exact properties requested
      request['user'] = {
        id: payload.sub,
        email: payload.email,
        role: payload.role,
        permissions: payload.permissions,
        tokenVersion: payload.tver,
      };

      return true;
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired access token');
    }
  }

  private extractToken(request: Request): string | null {
    // 1. Check cookies first
    if (request.cookies && request.cookies['access_token']) {
      return request.cookies['access_token'];
    }

    // 2. Check Authorization Bearer header
    const authHeader = request.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      return authHeader.substring(7);
    }

    return null;
  }
}
