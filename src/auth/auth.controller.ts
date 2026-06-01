import {
  Controller,
  Post,
  Body,
  Req,
  Res,
  Get,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { Public } from './decorators/public.decorator';
import { KeysService } from './keys.service';

const isProduction = process.env.NODE_ENV === 'production';
const cookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: 'lax' as const,
  path: '/',
};

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('register')
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Public()
  @Post('login')
  async login(
    @Body() dto: LoginDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const ip = req.ip || req.headers['x-forwarded-for']?.toString() || '';
    const userAgent = req.headers['user-agent'] || '';

    const result = await this.authService.login(dto, ip, userAgent);

    res.cookie('access_token', result.accessToken, {
      ...cookieOptions,
      maxAge: 15 * 60 * 1000, // 15 minutes
    });

    res.cookie('refresh_token', `${result.sessionId}.${result.refreshToken}`, {
      ...cookieOptions,
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    });

    return {
      success: true,
      user: result.user,
    };
  }

  @Public()
  @Post('refresh')
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const refreshCookie = req.cookies['refresh_token'];
    const ip = req.ip || req.headers['x-forwarded-for']?.toString() || '';
    const userAgent = req.headers['user-agent'] || '';

    const result = await this.authService.refresh(refreshCookie, ip, userAgent);

    res.cookie('access_token', result.accessToken, {
      ...cookieOptions,
      maxAge: 15 * 60 * 1000,
    });

    res.cookie('refresh_token', `${result.sessionId}.${result.refreshToken}`, {
      ...cookieOptions,
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    return {
      success: true,
      user: result.user,
    };
  }

  @Post('logout')
  async logout(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const refreshCookie = req.cookies['refresh_token'];
    if (refreshCookie) {
      const parts = refreshCookie.split('.');
      if (parts.length === 2) {
        const [sessionId] = parts;
        await this.authService.sessionsService.revokeSession(sessionId);
      }
    }

    res.clearCookie('access_token', cookieOptions);
    res.clearCookie('refresh_token', cookieOptions);

    return { success: true, message: 'Logged out successfully' };
  }

  @Post('logout/all')
  async logoutAll(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    // 1. Get userId from request (attached by global JwtAuthGuard)
    let userId = (req as any).user?.id;

    // 2. Fallback: Verify refresh token cookie to get userId if guard hasn't attached it
    if (!userId) {
      const refreshCookie = req.cookies['refresh_token'];
      if (refreshCookie) {
        const parts = refreshCookie.split('.');
        if (parts.length === 2) {
          const [sessionId, token] = parts;
          const session = await this.authService.sessionsService.verifySession(
            sessionId,
            token,
          );
          if (session) {
            userId = session.userId;
          }
        }
      }
    }

    if (userId) {
      await this.authService.sessionsService.revokeAllUserSessions(userId);
    }

    res.clearCookie('access_token', cookieOptions);
    res.clearCookie('refresh_token', cookieOptions);

    return {
      success: true,
      message: 'Logged out of all sessions successfully',
    };
  }
}

@Controller()
export class JwksController {
  constructor(private readonly keysService: KeysService) {}

  @Public()
  @Get('.well-known/jwks.json')
  getJwks() {
    return this.keysService.getJwks();
  }
}
