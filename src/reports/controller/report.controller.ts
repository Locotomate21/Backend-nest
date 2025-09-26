import {
  Controller,
  Get,
  Post,
  Delete,
  Patch,
  Param,
  Body,
  Req,
  HttpException,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiTags,
  ApiResponse,
  ApiBody,
} from '@nestjs/swagger';
import { ReportService } from '../report.service';
import { CreateReportDto } from '../dto/create-report.dto';
import { UpdateReportDto } from '../dto/update-report.dto';
import { ReportResponseDto } from '../dto/report-response.dto';
import { Roles } from '../../auth/roles.decorator';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { RolesGuard } from '../../auth/roles.guard';
import { Role } from '../../common/roles.enum';

@ApiTags('Report')
@ApiBearerAuth('jwt')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('report')
export class ReportController {
  constructor(private readonly reportService: ReportService) {}

  // ✅ CREATE - CORREGIDO
  @Post()
  @Roles(Role.Representative, Role.President)
  @ApiOperation({ summary: 'Create a new report (representative or president)' })
  @ApiBody({
    type: CreateReportDto,
    examples: {
      example: {
        summary: 'Example payload',
        value: {
          studentCode: 20165,
          reason: 'Filtración en el baño',
          actionTaken: 'Reparación programada',
          urgent: false,
          room: 'piso_2_cocina',
          description: 'Descripción detallada del daño',
          location: 'common_area'
        },
      },
    },
  })
  @ApiResponse({ status: 201, type: ReportResponseDto })
  async create(
    @Body() dto: CreateReportDto,
    @Req() req: any,
  ): Promise<ReportResponseDto> {
    console.log('User from request:', req.user); // Debug para ver qué contiene req.user
    
    try {
      // Usar req.user.sub en lugar de req.user.userId
      const userId = req.user.sub || req.user._id || req.user.id;
      
      if (!userId) {
        throw new HttpException('User ID not found in token', HttpStatus.UNAUTHORIZED);
      }
      
      console.log('Using userId:', userId);
      return await this.reportService.create(dto, userId);
    } catch (err) {
      console.error('Error in create report:', err);
      throw new HttpException(
        {
          error: 'Failed to create report',
          details: err instanceof Error ? err.message : String(err),
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  // ✅ READ ALL
  @Get()
  @Roles(Role.Representative, Role.President, Role.Resident)
  @ApiOperation({
    summary:
      'Get all reports (representative sees their floor, resident sees their own, president sees all)',
  })
  @ApiResponse({ status: 200, type: [ReportResponseDto] })
  async findAll(): Promise<ReportResponseDto[]> {
    return this.reportService.findAll();
  }

  // ✅ READ by Resident
  @Get('resident/:residentId')
  @Roles(Role.Representative, Role.President, Role.Resident)
  @ApiOperation({ summary: 'Get reports by resident (restrictions apply)' })
  @ApiResponse({ status: 200, type: [ReportResponseDto] })
  async findByResident(
    @Param('residentId') residentId: string,
  ): Promise<ReportResponseDto[]> {
    return this.reportService.findByResident(residentId);
  }

  // ✅ READ by ID
  @Get(':id')
  @Roles(Role.Representative, Role.President, Role.Resident)
  @ApiOperation({ summary: 'Get a report by ID (with role restrictions)' })
  @ApiResponse({ status: 200, type: ReportResponseDto })
  async findById(@Param('id') id: string): Promise<ReportResponseDto> {
    return this.reportService.findById(id);
  }

  // ✅ UPDATE
  @Patch(':id')
  @Roles(Role.Representative, Role.President)
  @ApiOperation({
    summary: 'Update a report (only representative or president)',
  })
  @ApiBody({
    type: UpdateReportDto,
    examples: {
      example: {
        summary: 'Example payload',
        value: {
          studentCode: 20165,
          reason: 'Motivo actualizado',
          actionTaken: 'Acción completada',
          urgent: true,
          room: '224',
          description: 'Descripción actualizada',
          location: 'room'
        },
      },
    },
  })
  @ApiResponse({ status: 200, type: ReportResponseDto })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateReportDto,
  ): Promise<ReportResponseDto> {
    return this.reportService.update(id, dto);
  }

  // ✅ DELETE
  @Delete(':id')
  @Roles(Role.Representative, Role.President)
  @ApiOperation({
    summary: 'Delete a report (only representative or president)',
  })
  @ApiResponse({ status: 200, description: 'Report deleted successfully' })
  async remove(@Param('id') id: string): Promise<{ message: string }> {
    await this.reportService.delete(id);
    return { message: 'Report deleted' };
  }
}