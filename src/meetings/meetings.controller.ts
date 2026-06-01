import { Controller, Post, Get, Patch, Body, Req, Param, UseGuards, BadRequestException } from '@nestjs/common';
import { MeetingsService } from './meetings.service';
import { Public } from '../auth/decorators/public.decorator';
import { RequirePermissions } from '../auth/decorators/permissions.decorator';
import { PermissionsGuard } from '../auth/guards/permissions.guard';

@Controller('meetings')
@UseGuards(PermissionsGuard)
export class MeetingsController {
  constructor(private readonly meetingsService: MeetingsService) {}

  @Public()
  @Post()
  async createMeeting(
    @Req() req: any,
    @Body() body: { clientName: string; clientEmail: string; meetingDate: string; duration?: number; projectDescription?: string },
  ) {
    if (!body.clientName || !body.clientEmail || !body.meetingDate) {
      throw new BadRequestException('clientName, clientEmail, and meetingDate are required');
    }

    // Attach verified user ID if the requester is authenticated
    const clientId = req.user?.id || null;

    const meeting = await this.meetingsService.createBooking({
      clientId,
      clientName: body.clientName,
      clientEmail: body.clientEmail,
      meetingDate: body.meetingDate,
      duration: body.duration,
      projectDescription: body.projectDescription,
    });

    return { success: true, meeting };
  }

  @Get('me')
  async getMyMeetings(@Req() req: any) {
    const clientId = req.user.id;
    const meetings = await this.meetingsService.getClientBookings(clientId);
    return { success: true, meetings };
  }

  @Get('admin')
  @RequirePermissions('admin:meetings:read')
  async getAdminMeetings() {
    const meetings = await this.meetingsService.getAllBookings();
    return { success: true, meetings };
  }

  @Patch('admin/:id/status')
  @RequirePermissions('admin:meetings:write')
  async updateStatus(
    @Param('id') id: string,
    @Body('status') status: 'CONFIRMED' | 'COMPLETED' | 'CANCELLED',
  ) {
    if (!status || !['CONFIRMED', 'COMPLETED', 'CANCELLED'].includes(status)) {
      throw new BadRequestException('Valid status is required');
    }

    const meeting = await this.meetingsService.changeMeetingStatus(id, status);
    return { success: true, meeting };
  }
}
