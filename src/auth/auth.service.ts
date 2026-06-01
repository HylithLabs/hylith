import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { RoleType } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';
import { CacheService } from '../cache/cache.service';
import { EventBusService } from '../events/event-bus.service';
import { PrismaService } from '../prisma/prisma.service';
import { SessionsService } from '../sessions/sessions.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { KeysService } from './keys.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly keysService: KeysService,
    public readonly sessionsService: SessionsService,
    private readonly jwtService: JwtService,
    private readonly eventBus: EventBusService,
    private readonly cacheService: CacheService,
  ) {}

  async register(dto: RegisterDto) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existingUser) {
      throw new ConflictException('Email already registered');
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);

    let role = await this.prisma.role.findUnique({
      where: { name: RoleType.USER },
    });

    if (!role) {
      role = await this.prisma.role.create({
        data: {
          name: RoleType.USER,
          description: 'Default user role',
        },
      });
    }

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        name: dto.name,
        passwordHash,
        userRoles: {
          create: {
            roleId: role.id,
          },
        },
      },
      include: {
        userRoles: {
          include: {
            role: true,
          },
        },
      },
    });

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      createdAt: user.createdAt,
    };
  }

  async login(dto: LoginDto, ipAddress?: string, deviceInfo?: string) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
      include: {
        userRoles: {
          include: {
            role: {
              include: {
                rolePermissions: {
                  include: {
                    permission: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!user || !user.passwordHash) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const refreshToken = crypto.randomBytes(40).toString('hex');
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    const session = await this.sessionsService.createSession(
      user.id,
      refreshToken,
      ipAddress,
      deviceInfo,
      expiresAt,
    );

    const roleName = user.userRoles[0]?.role?.name || RoleType.USER;
    const permissions = user.userRoles.flatMap((ur) =>
      ur.role.rolePermissions.map((rp) => rp.permission.name),
    );
    await this.cacheService.setCachedPermissions(user.id, permissions);

    await this.eventBus.publish('user.session.created', {
      userId: user.id,
      sessionId: session.id,
      ipAddress,
      deviceInfo,
    });

    const payload = {
      sub: user.id,
      email: user.email,
      role: roleName,
      permissions,
      tver: session.tokenVersion,
    };

    const accessToken = this.jwtService.sign(payload, {
      privateKey: this.keysService.getPrivateKey(),
      algorithm: 'RS256',
      expiresIn: '15m',
      keyid: this.keysService.getKid(),
    });

    return {
      accessToken,
      refreshToken,
      sessionId: session.id,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    };
  }

  async refresh(
    refreshTokenCookie: string,
    ipAddress?: string,
    deviceInfo?: string,
  ) {
    if (!refreshTokenCookie) {
      throw new UnauthorizedException('Refresh token is missing');
    }

    const parts = refreshTokenCookie.split('.');
    if (parts.length !== 2) {
      throw new UnauthorizedException('Invalid refresh token format');
    }

    const [sessionId, token] = parts;
    const session = await this.sessionsService.verifySession(sessionId, token);
    if (!session) {
      throw new UnauthorizedException('Session is invalid or expired');
    }

    const newRefreshToken = crypto.randomBytes(40).toString('hex');
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    const updatedSession = await this.sessionsService.rotateRefreshToken(
      sessionId,
      token,
      newRefreshToken,
      expiresAt,
    );

    const user = session.user;
    const roleName = user.userRoles[0]?.role?.name || RoleType.USER;
    const cachedPermissions = await this.cacheService.getCachedPermissions(user.id);
    const permissions =
      cachedPermissions ||
      user.userRoles.flatMap((ur) =>
        ur.role.rolePermissions.map((rp) => rp.permission.name),
      );
    if (!cachedPermissions) {
      await this.cacheService.setCachedPermissions(user.id, permissions);
    }

    const payload = {
      sub: user.id,
      email: user.email,
      role: roleName,
      permissions,
      tver: updatedSession.tokenVersion,
    };

    const accessToken = this.jwtService.sign(payload, {
      privateKey: this.keysService.getPrivateKey(),
      algorithm: 'RS256',
      expiresIn: '15m',
      keyid: this.keysService.getKid(),
    });

    return {
      accessToken,
      refreshToken: newRefreshToken,
      sessionId,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    };
  }
}
