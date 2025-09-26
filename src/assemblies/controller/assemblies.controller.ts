    import { Controller, Get, Post, Put, Delete, Patch, Body, Param, Req, UseGuards } from '@nestjs/common';
    import { ApiTags, ApiBearerAuth, ApiOperation, ApiBody, ApiResponse } from '@nestjs/swagger';
    import { AssembliesService } from '../assemblies.service';
    import { CreateAssemblyDto } from '../dto/create-assembly.dto';
    import { UpdateAssemblyDto } from '../dto/update-assembly.dto';
    import { UpdateAssemblyStatusDto } from '../dto/update-assembly-status.dto';
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

    // ✅ CREAR
    @Post()
    @Roles(Role.Admin, Role.Representative, Role.President, Role.SecretaryGeneral)
    @ApiOperation({ summary: 'Crear una asamblea' })
    @ApiBody({ type: CreateAssemblyDto })
    @ApiResponse({ status: 201, description: 'Asamblea creada correctamente' })
    async create(@Body() dto: CreateAssemblyDto, @Req() req: any) {
        return this.assembliesService.create(dto, req.user);
    }

    // ✅ OBTENER TODAS
    @Get()
    @Roles(Role.Admin, Role.Representative, Role.Resident, Role.President, Role.SecretaryGeneral)
    @ApiOperation({ summary: 'Obtener todas las asambleas filtradas por permisos' })
    @ApiResponse({ status: 200, description: 'Lista de asambleas' })
    async findAll(@Req() req: any) {
        return this.assembliesService.findAll(req.user);
    }

    // ✅ OBTENER POR ID
    @Get(':id')
    @Roles(Role.Admin, Role.Representative, Role.Resident, Role.President, Role.SecretaryGeneral)
    @ApiOperation({ summary: 'Obtener una asamblea por ID' })
    @ApiResponse({ status: 200, description: 'Asamblea encontrada' })
    @ApiResponse({ status: 404, description: 'Asamblea no encontrada' })
    async findOne(@Param('id') id: string, @Req() req: any) {
        return this.assembliesService.findOne(id, req.user);
    }

    // ✅ ACTUALIZAR
    @Put(':id')
    @Roles(Role.Admin, Role.Representative, Role.President, Role.SecretaryGeneral)
    @ApiOperation({ summary: 'Actualizar una asamblea' })
    @ApiBody({ type: UpdateAssemblyDto })
    @ApiResponse({ status: 200, description: 'Asamblea actualizada correctamente' })
    async update(@Param('id') id: string, @Body() dto: UpdateAssemblyDto, @Req() req: any) {
        return this.assembliesService.update(id, dto, req.user);
    }

    // 🆕 CAMBIAR ESTADO
    @Patch(':id/status')
    @Roles(Role.Admin, Role.Representative, Role.President, Role.SecretaryGeneral)
    @ApiOperation({ summary: 'Cambiar estado de asamblea' })
    @ApiBody({ type: UpdateAssemblyStatusDto })
    @ApiResponse({ status: 200, description: 'Estado actualizado correctamente' })
    async updateStatus(
    @Param('id') id: string,
    @Body() statusDto: UpdateAssemblyStatusDto,
    @Req() req: any,
    ) {
    return this.assembliesService.updateStatus(id, statusDto, req.user);
    }

    // ✅ ELIMINAR
    @Delete(':id')
    @Roles(Role.Admin, Role.Representative, Role.President, Role.SecretaryGeneral)
    @ApiOperation({ summary: 'Eliminar una asamblea' })
    @ApiResponse({ status: 200, description: 'Asamblea eliminada correctamente' })
    async delete(@Param('id') id: string, @Req() req: any) {
        await this.assembliesService.delete(id, req.user);
        return { message: 'Asamblea eliminada correctamente' };
    }

    // 🆕 OBTENER POR ESTADO
    @Get('status/:status')
    @Roles(Role.Admin, Role.Representative, Role.Resident, Role.President, Role.SecretaryGeneral)
    @ApiOperation({ summary: 'Obtener asambleas por estado' })
    @ApiResponse({ status: 200, description: 'Lista de asambleas filtradas por estado' })
    async findByStatus(@Param('status') status: string, @Req() req: any) {
        return this.assembliesService.findByStatus(status, req.user);
    }
    }
