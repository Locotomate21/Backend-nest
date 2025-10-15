import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger';
import { StatsService } from '../stats.service';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { StatsResponseDto } from '../dto/stats-response.dto';
import { RolesGuard } from 'src/auth/roles.guard';
import { Roles } from '../../auth/roles.decorator';
import { Role } from '../../common/roles.enum';

@ApiTags('Stats')
@ApiBearerAuth('jwt')
@Controller('stats')
@UseGuards(JwtAuthGuard, RolesGuard)
export class StatsController {
  constructor(private readonly statsService: StatsService) {}

  // Endpoint general
  @Get()
  @Roles(Role.Representative, Role.Admin, Role.Resident)
  @ApiResponse({ status: 200, type: StatsResponseDto })
  async getStats(@Req() req: any): Promise<StatsResponseDto> {
    return this.statsService.getStats(req.user);
  }

  // Endpoint específico para el dashboard del representante - CORREGIDO
  @Get('representative/dashboard')
  @Roles(Role.Representative)
  @ApiResponse({ status: 200, type: StatsResponseDto })
  async getRepresentativeDashboard(@Req() req: any): Promise<StatsResponseDto> {
    const user = req.user;
    return this.statsService.getStats(user);
  }
}