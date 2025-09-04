    import { Controller, Get, Post, Delete, Body, Param, Req, UseGuards } from '@nestjs/common';
    import { ApiTags, ApiBearerAuth, ApiOperation, ApiBody, ApiResponse } from '@nestjs/swagger';
    import { AssembliesService } from '../assemblies.service';
    import { CreateAssemblyDto } from '../dto/create-assembly.dto';
    import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
    import { RolesGuard } from '../../auth/roles.guard';
    import { Roles } from '../../auth/roles.decorator';
    import { Role } from '../../common/roles.enum';

    @ApiTags('Assemblies')
    @ApiBearerAuth('jwt')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Controller('assemblies')
    export class AssembliesController {
    constructor(private readonly assembliesService: AssembliesService) {}

    @Post()
    @Roles(Role.Admin, Role.Representative)
    @ApiOperation({ summary: 'Crear una asamblea' })
    @ApiBody({ type: CreateAssemblyDto })
    @ApiResponse({ status: 201, description: 'Asamblea creada correctamente' })
    async create(@Body() dto: CreateAssemblyDto, @Req() req: any) {
        return this.assembliesService.create(dto, req.user);
    }

    @Get()
    @Roles(Role.Admin, Role.Representative, Role.Resident)
    @ApiOperation({ summary: 'Obtener todas las asambleas filtradas' })
    async findAll(@Req() req: any) {
        return this.assembliesService.findAll(req.user);
    }

    @Get(':id')
    @Roles(Role.Admin, Role.Representative, Role.Resident)
    @ApiOperation({ summary: 'Obtener una asamblea por ID' })
    async findOne(@Param('id') id: string, @Req() req: any) {
        return this.assembliesService.findOne(id, req.user);
    }

    @Delete(':id')
    @Roles(Role.Admin, Role.Representative)
    @ApiOperation({ summary: 'Eliminar una asamblea' })
    async delete(@Param('id') id: string, @Req() req: any) {
        return this.assembliesService.delete(id, req.user);
    }
    }
