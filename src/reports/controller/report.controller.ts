import { Controller, Get, Post, Delete, Patch, Param, Body, Req, HttpException, HttpStatus, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags, ApiResponse } from '@nestjs/swagger';
import { ReportsService } from '../report.service';
import { CreateReportDto } from '../dto/create-report.dto';
import { UpdateReportDto } from '../dto/update-report.dto';
import { ReportResponseDto } from '../dto/report-response.dto';
import { Roles } from '../../auth/roles.decorator';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { RolesGuard } from '../../auth/roles.guard';

@ApiTags('Reports')
@ApiBearerAuth('jwt')
@UseGuards(JwtAuthGuard, RolesGuard) // si no están globales
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  // ✅ CREATE (solo "representante")
  @Post()
  @Roles('representante')
  @ApiOperation({ summary: 'Create a new report (representante only)' })
  @ApiResponse({ status: 201, type: ReportResponseDto })
  async create(@Body() dto: CreateReportDto, @Req() req: any): Promise<ReportResponseDto> {
    try {
      return await this.reportsService.create(dto, req.user.userId);
    } catch (err) {
      throw new HttpException(
        { error: 'Failed to create report', details: err instanceof Error ? err.message : String(err) },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  // ✅ READ ALL
  @Get()
  @ApiOperation({ summary: 'Get all reports' })
  async findAll(): Promise<ReportResponseDto[]> {
    return this.reportsService.findAll();
  }

  // ✅ READ by ID
  @Get(':id')
  @ApiOperation({ summary: 'Get a report by ID' })
  async findById(@Param('id') id: string): Promise<ReportResponseDto> {
    return this.reportsService.findById(id);
  }

  // ✅ READ by resident
  @Get('resident/:residentId')
  @ApiOperation({ summary: 'Get reports by resident' })
  async findByResident(@Param('residentId') residentId: string, @Req() req: any): Promise<ReportResponseDto[]> {
    return this.reportsService.findByResident(residentId, req.user);
  }

  // ✅ UPDATE (PATCH o PUT)
  @Patch(':id')
  @ApiOperation({ summary: 'Update a report' })
  async update(@Param('id') id: string, @Body() dto: UpdateReportDto): Promise<ReportResponseDto> {
    return this.reportsService.update(id, dto);
  }

  // ✅ DELETE
  @Delete(':id')
  @ApiOperation({ summary: 'Delete a report' })
  async remove(@Param('id') id: string): Promise<{ message: string }> {
    await this.reportsService.remove(id);
    return { message: 'Report deleted' };
  }
}