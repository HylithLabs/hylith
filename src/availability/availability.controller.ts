import { Controller, Get, Patch, Query, Body, Req, UseGuards } from '@nestjs/common';
import { AvailabilityService } from './availability.service';
import { Public } from '../auth/decorators/public.decorator';
import { RequirePermissions } from '../auth/decorators/permissions.decorator';
import { PermissionsGuard } from '../auth/guards/permissions.guard';

@Controller('availability')
@UseGuards(PermissionsGuard)
export class AvailabilityController {
  constructor(private readonly availabilityService: AvailabilityService) {}

  @Public()
  @Get('slots')
  async getSlots(@Query('date') date: string) {
    if (!date) {
      return { success: false, message: 'Date parameter is required' };
    }
    const slots = await this.availabilityService.getAvailableSlots(date);
    return { success: true, slots };
  }

  @Patch('settings')
  @RequirePermissions('availability:manage')
  async updateSettings(
    @Req() req: any,
    @Body() body: { availableDays: number[]; timeSlots: any[]; meetingDuration: number; leadTime: number },
  ) {
    const userId = req.user.id;
    const settings = await this.availabilityService.updateSettings(userId, body);
    return { success: true, settings };
  }
}
