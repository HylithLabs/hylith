import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { KeysService } from '../auth/keys.service';

@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  },
})
export class RealtimeGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(RealtimeGateway.name);
  private connectedSockets = new Map<string, string>(); // socket.id -> userId

  // Coalescing buffer for high-frequency availability updates
  private availabilityCoalesceTimer?: NodeJS.Timeout;
  private coalescedAvailabilityMap = new Map<string, any>(); // userId -> merged payload

  constructor(
    private readonly jwtService: JwtService,
    private readonly keysService: KeysService,
  ) {}

  async handleConnection(socket: Socket) {
    try {
      const token = this.extractToken(socket);
      if (!token) {
        this.logger.warn(`Connection rejected: Token not found on socket ${socket.id}`);
        socket.disconnect(true);
        return;
      }

      const payload = await this.jwtService.verifyAsync(token, {
        publicKey: this.keysService.getPublicKey(),
        algorithms: ['RS256'],
      });

      const userId = payload.sub;
      const role = payload.role;

      this.connectedSockets.set(socket.id, userId);

      // 1. Join user private channel
      await socket.join(`user:${userId}`);

      // 2. Join admin global channel if role matches admin profiles
      if (role === 'ADMIN' || role === 'SUPER_ADMIN') {
        await socket.join('admin:global');
        this.logger.log(`Admin user ${userId} joined admin:global channel`);
      }

      this.logger.log(`Client connected: Socket ${socket.id} matched to user ${userId}`);
    } catch (err) {
      this.logger.warn(`Auth failed on socket connection ${socket.id}: ${err.message}`);
      socket.disconnect(true);
    }
  }

  handleDisconnect(socket: Socket) {
    const userId = this.connectedSockets.get(socket.id);
    if (userId) {
      this.connectedSockets.delete(socket.id);
      this.logger.log(`Client disconnected: Socket ${socket.id} (user ${userId})`);
    }
  }

  @SubscribeMessage('subscribe:meeting')
  async handleSubscribeMeeting(
    @ConnectedSocket() socket: Socket,
    @MessageBody() body: { meetingId: string },
  ) {
    if (body?.meetingId) {
      await socket.join(`meeting:${body.meetingId}`);
      this.logger.log(`Socket ${socket.id} subscribed to meeting:${body.meetingId}`);
      return { success: true, room: `meeting:${body.meetingId}` };
    }
    return { success: false, error: 'meetingId is required' };
  }

  // Safe Broadcast: checks socket backpressure before writing
  private emitSafe(room: string, event: string, payload: any, isCritical = true) {
    // Get all sockets currently in this room
    const socketsInRoom = this.server.sockets.adapter.rooms.get(room);
    if (!socketsInRoom) return;

    for (const socketId of socketsInRoom) {
      const socket = this.server.sockets.sockets.get(socketId);
      if (socket) {
        const buffered = (socket.conn as any)?.bufferedAmount || 0;
        
        // If client is severely lagging (>50 packets queued) and message is non-critical, shed it!
        if (buffered > 50 && !isCritical) {
          this.logger.warn(`Shedding WS frame ${event} to slow client socket ${socket.id} (Buffered amount: ${buffered})`);
          continue; 
        }
        
        socket.emit(event, payload);
      }
    }
  }

  // Broadcasters triggered by Stream consumers and existing application components
  async emitToUser(userId: string, event: string, payload: any, eventId?: string) {
    this.emitSafe(`user:${userId}`, event, { ...payload, eventId }, true);
  }

  async emitToMeeting(meetingId: string, event: string, payload: any, eventId?: string) {
    this.emitSafe(`meeting:${meetingId}`, event, { ...payload, eventId }, true);
  }

  async emitToAdmins(event: string, payload: any, eventId?: string) {
    this.emitSafe('admin:global', event, { ...payload, eventId }, true);
  }

  async emitToAvailability(event: string, payload: any, eventId?: string) {
    const userId = payload.userId;
    if (!userId) {
      // If no userId, broadcast immediately
      this.server.emit(event, { ...payload, eventId });
      return;
    }

    // 2. BROADCAST COALESCING: Buffer slot updates for 1000ms to throttle burst spikes
    this.coalescedAvailabilityMap.set(userId, { ...payload, eventId });

    if (!this.availabilityCoalesceTimer) {
      this.availabilityCoalesceTimer = setTimeout(() => {
        const mergedList = Array.from(this.coalescedAvailabilityMap.values());
        this.coalescedAvailabilityMap.clear();
        this.availabilityCoalesceTimer = undefined;

        this.logger.log(`Coalesced broadcast: Emitting ${mergedList.length} availability updates.`);
        
        // Emit coalesced slots to all non-lagging clients
        const allSockets = this.server.sockets.sockets;
        for (const [id, socket] of allSockets) {
          const buffered = (socket.conn as any)?.bufferedAmount || 0;
          if (buffered <= 50) {
            socket.emit('availability.updated.batch', { updates: mergedList });
          } else {
            this.logger.warn(`Shedding coalesced slots broadcast to slow client ${id}`);
          }
        }
      }, 1000);
    }
  }

  // Legacy compatibility mappings for internal consumers
  sendToUser(userId: string, event: string, payload: any) {
    this.emitToUser(userId, event, payload);
  }

  sendToAdmin(event: string, payload: any) {
    this.emitToAdmins(event, payload);
  }

  sendToMeeting(meetingId: string, event: string, payload: any) {
    this.emitToMeeting(meetingId, event, payload);
  }

  broadcast(event: string, payload: any) {
    this.emitToAvailability(event, payload);
  }

  private extractToken(socket: Socket): string | null {
    const authHeader = socket.handshake.auth?.token || socket.handshake.headers?.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      return authHeader.substring(7);
    }

    const cookieHeader = socket.handshake.headers?.cookie;
    if (cookieHeader) {
      const match = cookieHeader.match(/access_token=([^;]+)/);
      if (match) {
        return match[1];
      }
    }

    return null;
  }
}

