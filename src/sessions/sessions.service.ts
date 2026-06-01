import { Injectable, UnauthorizedException } from '@nestjs/common';
import * as crypto from 'crypto';
import { CacheService } from '../cache/cache.service';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SessionsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cacheService: CacheService,
  ) {}

  async createSession(
    userId: string,
    refreshToken: string,
    ipAddress?: string,
    deviceInfo?: string,
    expiresAt?: Date,
  ) {
    const hash = crypto.createHash('sha256').update(refreshToken).digest('hex');
    const expiry = expiresAt || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    const session = await this.prisma.session.create({
      data: {
        userId,
        refreshTokenHash: hash,
        ipAddress,
        deviceInfo,
        expiresAt: expiry,
      },
    });

    await this.cacheService.setSessionMetadata(session.id, {
      userId,
      ipAddress,
      deviceInfo,
      expiresAt: session.expiresAt.toISOString(),
      tokenVersion: session.tokenVersion,
    });

    return session;
  }

  async verifySession(sessionId: string, token: string) {
    const hash = crypto.createHash('sha256').update(token).digest('hex');

    const session = await this.prisma.session.findUnique({
      where: { id: sessionId },
      include: {
        user: {
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
        },
      },
    });

    if (!session) {
      return null;
    }

    if (session.refreshTokenHash !== hash) {
      return null;
    }

    if (session.expiresAt < new Date()) {
      await this.revokeSession(sessionId);
      return null;
    }

    await this.cacheService.setSessionMetadata(session.id, {
      userId: session.userId,
      ipAddress: session.ipAddress,
      deviceInfo: session.deviceInfo,
      expiresAt: session.expiresAt.toISOString(),
      tokenVersion: session.tokenVersion,
    });

    return session;
  }

  async revokeSession(sessionId: string) {
    await this.prisma.session.deleteMany({
      where: { id: sessionId },
    });
    await this.cacheService.del(`cache:user:session:${sessionId}`);
  }

  async revokeAllUserSessions(userId: string) {
    const sessions = await this.prisma.session.findMany({
      where: { userId },
      select: { id: true },
    });
    await this.prisma.session.deleteMany({
      where: { userId },
    });
    for (const session of sessions) {
      await this.cacheService.del(`cache:user:session:${session.id}`);
    }
  }

  async rotateRefreshToken(
    sessionId: string,
    oldToken: string,
    newToken: string,
    expiresAt: Date,
  ) {
    const session = await this.prisma.session.findUnique({
      where: { id: sessionId },
    });

    if (!session) {
      throw new UnauthorizedException('Session not found');
    }

    const oldHash = crypto.createHash('sha256').update(oldToken).digest('hex');

    if (session.refreshTokenHash !== oldHash) {
      await this.revokeAllUserSessions(session.userId);
      throw new UnauthorizedException(
        'Token reuse detected. All user sessions have been revoked for security.',
      );
    }

    const newHash = crypto.createHash('sha256').update(newToken).digest('hex');

    const updated = await this.prisma.session.update({
      where: { id: sessionId },
      data: {
        refreshTokenHash: newHash,
        expiresAt,
        tokenVersion: { increment: 1 },
        lastActive: new Date(),
      },
    });

    await this.cacheService.setSessionMetadata(updated.id, {
      userId: updated.userId,
      ipAddress: updated.ipAddress,
      deviceInfo: updated.deviceInfo,
      expiresAt: updated.expiresAt.toISOString(),
      tokenVersion: updated.tokenVersion,
    });

    return updated;
  }
}
