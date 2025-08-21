import { Controller, Get, Post, Delete, Patch, Param, Body, Req, HttpException, HttpStatus, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags, ApiResponse, ApiBody } from '@nestjs/swagger';
import { ReportsService } from '../report.service';
import { CreateReportDto } from '../dto/create-report.dto';
import { UpdateReportDto } from '../dto/update-report.dto';
import { ReportResponseDto } from '../dto/report-response.dto';
import { Roles } from '../../auth/roles.decorator';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { RolesGuard } from '../../auth/roles.guard';
import { Role } from '../../common/roles.enum';

@ApiTags('Reports')
@ApiBearerAuth('jwt')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  // ✅ CREATE
  @Post()
  @Roles(Role.Representative, Role.Admin)
  @ApiOperation({ summary: 'Create a new report (representative or admin)' })
  @ApiBody({
    type: CreateReportDto,
    schema: {
      example: {
        resident: 'residentIdHere',
        reason: 'Daño en la ducha del baño 301',
        actionTaken: 'Se reemplazó la grifería',
      },
    },
  })
  @ApiResponse({ status: 201, type: ReportResponseDto })
  async create(@Body() dto: CreateReportDto, @Req() req: any): Promise<ReportResponseDto> {
    try {
      return await this.reportsService.create(dto, req.user.sub);
    } catch (err) {
      throw new HttpException(
        { error: 'Failed to create report', details: err instanceof Error ? err.message : String(err) },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  // ✅ READ ALL
  @Get()
  @Roles(Role.Representative, Role.Admin)
  @ApiOperation({ summary: 'Get all reports (admin sees all, representative sees their own, resident sees their own)' })
  @ApiResponse({ status: 200, type: [ReportResponseDto] })
  async findAll(@Req() req: any): Promise<ReportResponseDto[]> {
    return this.reportsService.findAll(req.user);
  }

  // ✅ READ by ID
  @Get(':id')
  @Roles(Role.Representative, Role.Admin)
  @ApiOperation({ summary: 'Get a report by ID (with role restrictions)' })
  @ApiResponse({ status: 200, type: ReportResponseDto })
  async findById(@Param('id') id: string, @Req() req: any): Promise<ReportResponseDto> {
    return this.reportsService.findById(id, req.user);
  }

  // ✅ READ by Resident
  @Get('resident/:residentId')
  @Roles(Role.Representative, Role.Admin)
  @ApiOperation({ summary: 'Get reports by resident (restrictions apply)' })
  @ApiResponse({ status: 200, type: [ReportResponseDto] })
  async findByResident(@Param('residentId') residentId: string, @Req() req: any): Promise<ReportResponseDto[]> {
    return this.reportsService.findByResident(residentId, req.user);
  }

  // ✅ UPDATE
  @Patch(':id')
  @Roles(Role.Admin, Role.Representative)
  @ApiOperation({ summary: 'Update a report (admin or representative who created it)' })
  @ApiBody({
    type: UpdateReportDto,
    schema: {
      example: {
        resident: 'residentIdHere',
        reason: 'Actualización del motivo',
        actionTaken: 'Acción realizada',
      },
    },
  })
  @ApiResponse({ status: 200, type: ReportResponseDto })
  async update(@Param('id') id: string, @Body() dto: UpdateReportDto, @Req() req: any): Promise<ReportResponseDto> {
    return this.reportsService.update(id, dto, req.user);
  }

  // ✅ DELETE
  @Delete(':id')
  @Roles(Role.Admin, Role.Representative)
  @ApiOperation({ summary: 'Delete a report (admin or representative who created it)' })
  @ApiResponse({ status: 200, description: 'Report deleted successfully' })
  async remove(@Param('id') id: string, @Req() req: any): Promise<{ message: string }> {
    await this.reportsService.remove(id, req.user);
    return { message: 'Report deleted' };
  }
}
