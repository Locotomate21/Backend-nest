    import { 
    Controller, 
    Get, 
    Post, 
    Body, 
    Patch, 
    Param, 
    Delete, 
    Req, 
    UseGuards, 
    ParseIntPipe 
    } from '@nestjs/common';
    import { DisciplinaryMeasuresService } from '../disciplinary-measures.service';
    import { CreateDisciplinaryMeasureDto } from '../dto/create-disciplinary-measure.dto';
    import { UpdateDisciplinaryMeasureDto } from '../dto/update-disciplinary-measure.dto';
    import { Roles } from '../../auth/roles.decorator';
    import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
    import { Role } from '../../common/roles.enum';
    import { RolesGuard } from '../../auth/roles.guard';
    import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
    import type { Request } from 'express';

    @ApiTags('Disciplinary Measures') 
    @ApiBearerAuth('jwt')
    @Controller('disciplinary-measures')
    @UseGuards(JwtAuthGuard, RolesGuard)
    export class DisciplinaryMeasuresController {
    constructor(
        private readonly disciplinaryMeasuresService: DisciplinaryMeasuresService,
    ) {}

    // 👉 Crear medida
    @Post()
    @Roles(Role.Representative, Role.FloorAuditor, Role.President, Role.GeneralAuditor)
    create(@Body() dto: CreateDisciplinaryMeasureDto, @Req() req: Request) {
        const user = req.user as any; // { id, role, floor }
        return this.disciplinaryMeasuresService.create(dto, user);
    }

    // 👉 Listar todas
    @Get()
    @Roles(Role.Representative, Role.FloorAuditor, Role.President, Role.GeneralAuditor)
    findAll(@Req() req: Request) {
        const user = req.user as any;
        return this.disciplinaryMeasuresService.findAll(user);
    }

    // 👉 Ver medidas de un residente específico por studentCode
    @Get('resident/:studentCode')
    @Roles(Role.Representative, Role.FloorAuditor, Role.President, Role.GeneralAuditor)
    findByResident(@Param('studentCode', ParseIntPipe) studentCode: number) {
        return this.disciplinaryMeasuresService.findByResident(studentCode);
    }

    // 👉 Ver UNA medida puntual
    @Get(':id')
    @Roles(Role.Representative, Role.FloorAuditor, Role.President, Role.GeneralAuditor)
    findOne(@Param('id') id: string) {
        return this.disciplinaryMeasuresService.findOne(id);
    }

    // 👉 Ver MIS medidas (solo residentes)
    @Get('my/measures')
    @Roles(Role.Resident, Role.Representative, Role.FloorAuditor)
    findMyMeasures(@Req() req: Request) {
        const user = req.user as any;
        return this.disciplinaryMeasuresService.findByResident(user.studentCode); // 👈 usa el código del JWT
    }

    // 👉 Editar medida
    @Patch(':id')
    @Roles(Role.President, Role.GeneralAuditor, Role.Representative, Role.FloorAuditor)
    update(
        @Param('id') id: string, 
        @Body() dto: UpdateDisciplinaryMeasureDto, 
        @Req() req: Request,
    ) {
        const user = req.user as any;
        return this.disciplinaryMeasuresService.update(id, dto, user);
    }

    // 👉 Eliminar medida
    @Delete(':id')
    @Roles(Role.President, Role.GeneralAuditor, Role.Representative, Role.FloorAuditor)
    remove(@Param('id') id: string) {
        return this.disciplinaryMeasuresService.remove(id);
    }
    }
