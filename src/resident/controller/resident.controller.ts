import { Controller, Get, Post, Put, Delete, Body, Param, Req, UseGuards, HttpCode, HttpStatus, HttpException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { ResidentService } from '../resident.service';
import { CreateResidentDto } from '../dto/create-resident.dto';
import { UpdateResidentDto } from '../dto/update-resident.dto';
import { Resident } from '../schema/resident.schema';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { RolesGuard } from '../../auth/roles.guard';
import { Roles } from '../../auth/roles.decorator';
import { Role } from '../../common/roles.enum';

@ApiTags('Residents')
@ApiBearerAuth('jwt')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('resident')
export class ResidentController {
  constructor(private readonly residentService: ResidentService) {}

  // 🔹 CREATE (solo admin o representative)
  @Post()
  @Roles(Role.Admin, Role.Representative)
  @ApiOperation({ summary: 'Create a new resident (admin or representative only)' })
  @ApiResponse({ status: 201, description: 'Resident created successfully.', type: Resident })
  async create(@Body() createResidentDto: CreateResidentDto, @Req() req: any): Promise<Resident> {
    // Pasamos el usuario que hace la creación al servicio
    return this.residentService.create(createResidentDto, req.user);
  }

  // 🔹 READ ALL
  @Get()
  @Roles(Role.Representative, Role.Admin)
  @ApiOperation({ summary: 'Get all residents' })
  @ApiResponse({ status: 200, description: 'List of residents', type: [Resident] })
  async findAll(): Promise<Resident[]> {
    return this.residentService.findAll();
  }
  
  // 🔹 GET /resident/me
  @Get('me')
  @Roles(Role.Resident, Role.Representative, Role.Admin)
  async getMyProfile(@Req() req: any): Promise<Resident> {
    console.log('👤 Usuario en request:', req.user);
    const userId = req.user?._id; // 👈 aquí estaba el detalle
    if (!userId) throw new HttpException('User ID no encontrado', 401);
    return this.residentService.findResidentByUserId(userId);
  }

  // 🔹 READ BY ID
  @Get(':id')
  @Roles(Role.Representative, Role.Admin)
  @ApiOperation({ summary: 'Get a resident by ID' })
  @ApiResponse({ status: 200, description: 'Resident found', type: Resident })
  async findOne(@Param('id') id: string): Promise<Resident> {
    return this.residentService.findOne(id);
  }

  // 🔹 UPDATE (solo admin o representative) 
  @Put(':id')
  @Roles(Role.Admin, Role.Representative)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({ summary: 'Update a resident (admin or representative only)' })
  @ApiBody({
    type: UpdateResidentDto,
    schema: {
      example: {
        fullName: "string",
        idNumber: 0,
        studentCode: 0,
        email: "string",
        academicProgram: "string",
        role: "string",
        benefitOrActivity: "string",
        period: "string",
        admissionYear: 0,
        room: "657890abcdef1234567890ab",
      },
    },
  })
  async update(
    @Param('id') id: string,
    @Body() updateResidentDto: UpdateResidentDto,
    @Req() req: any
  ): Promise<Resident> {
    return this.residentService.update(id, updateResidentDto, req.user);
  }
  // 🔹 DELETE (solo admin)
  @Delete(':id')
  @Roles(Role.Representative, Role.Admin)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a resident (admin only)' })
  async remove(@Param('id') id: string, @Req() req: any): Promise<void> {
    await this.residentService.remove(id, req.user);
  }
}
