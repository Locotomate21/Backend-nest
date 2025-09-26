    import { Injectable, ForbiddenException, NotFoundException, BadRequestException } from '@nestjs/common';
    import { InjectModel } from '@nestjs/mongoose';
    import { Model } from 'mongoose';
    import { Assembly, AssemblyDocument } from './schema/assembly.schema';
    import { CreateAssemblyDto } from './dto/create-assembly.dto';
    import { UpdateAssemblyDto } from './dto/update-assembly.dto';
    import { UpdateAssemblyStatusDto } from './dto/update-assembly-status.dto'; // ✅ usar el DTO desde su archivo
    import { Role } from '../common/roles.enum';

    @Injectable()
    export class AssembliesService {
    constructor(@InjectModel(Assembly.name) private assemblyModel: Model<AssemblyDocument>) {}

    // 1️⃣ CREAR
    async create(dto: CreateAssemblyDto, user: any): Promise<AssemblyDocument> {
  // Validar permisos
        if (![Role.Admin, Role.Representative, Role.President, Role.SecretaryGeneral].includes(user.role)) {
            throw new ForbiddenException('No tienes permiso para crear asambleas');
        }

        // Validar campos obligatorios
        if (!dto.title?.trim() || !dto.date || !dto.time || !dto.location?.trim()) {
            throw new BadRequestException('Faltan campos obligatorios: título, fecha, hora y ubicación');
        }

        // Lógica para asambleas de piso
        if (dto.type === 'floor') {
            if (user.role === Role.Representative) {
            if (!user.floor) {
                throw new ForbiddenException('Representante debe tener piso asignado');
            }
            dto.floor = user.floor; // 🔹 Se asigna automáticamente
            } else if (![Role.Admin, Role.President, Role.SecretaryGeneral].includes(user.role)) {
            throw new ForbiddenException('Solo representantes o roles altos pueden crear asambleas de piso');
            }
        }

        // Lógica para asambleas generales
        if (dto.type === 'general') {
            if (![Role.Admin, Role.President, Role.SecretaryGeneral].includes(user.role)) {
            throw new ForbiddenException('Solo admin, presidente o secretario general pueden crear asambleas generales');
            }
        }

        const assembly = new this.assemblyModel({
            ...dto,
            createdBy: user.fullName || user.sub,
            status: 'Programada', // Estado inicial
        });

        return assembly.save();
        }

    // 2️⃣ OBTENER TODAS
    async findAll(user: any): Promise<AssemblyDocument[]> {
        if (user.role === Role.Resident || user.role === Role.Representative) {
        return this.assemblyModel.find({
            $or: [{ type: 'general' }, { type: 'floor', floor: user.floor }],
        });
        }
        return this.assemblyModel.find();
    }

    // 3️⃣ OBTENER POR ID
    async findOne(id: string, user: any): Promise<AssemblyDocument | null> {
        const assembly = await this.assemblyModel.findById(id);
        if (!assembly) throw new NotFoundException('Asamblea no encontrada');

        if (
        assembly.type === 'floor' &&
        assembly.floor !== user.floor &&
        ![Role.Admin, Role.President, Role.SecretaryGeneral].includes(user.role)
        ) {
        throw new ForbiddenException('No tienes permiso para ver esta asamblea');
        }

        return assembly;
    }

    // 4️⃣ ACTUALIZAR
    async update(id: string, dto: UpdateAssemblyDto, user: any): Promise<AssemblyDocument> {
        const assembly = await this.assemblyModel.findById(id);
        if (!assembly) throw new NotFoundException('Asamblea no encontrada');

        if (!this.canManageAssembly(assembly, user)) {
        throw new ForbiddenException('No tienes permiso para editar esta asamblea');
        }

        if (assembly.status === 'Completada' || assembly.status === 'Cancelada') {
        throw new BadRequestException('No se puede editar una asamblea completada o cancelada');
        }

        Object.assign(assembly, dto);
        return assembly.save();
    }

    // 5️⃣ CAMBIAR ESTADO
    async updateStatus(id: string, statusDto: UpdateAssemblyStatusDto, user: any): Promise<AssemblyDocument> {
        const assembly = await this.assemblyModel.findById(id);
        if (!assembly) throw new NotFoundException('Asamblea no encontrada');

        if (!this.canManageAssembly(assembly, user)) {
        throw new ForbiddenException('No tienes permiso para cambiar el estado de esta asamblea');
        }

        if (assembly.status !== 'Programada') {
        throw new BadRequestException('Solo se pueden cambiar asambleas en estado "Programada"');
        }

        switch (statusDto.status) {
        case 'Completada':
            assembly.status = 'Completada';
            break;

        case 'Aplazada':
            if (!statusDto.postponementReason?.trim()) {
            throw new BadRequestException('El motivo de aplazamiento es obligatorio');
            }
            assembly.status = 'Aplazada';
            assembly.postponementReason = statusDto.postponementReason;
            if (statusDto.newDate) assembly.newDate = statusDto.newDate;
            if (statusDto.newTime) assembly.newTime = statusDto.newTime;
            break;

        case 'Cancelada':
            assembly.status = 'Cancelada';
            if (statusDto.postponementReason) assembly.postponementReason = statusDto.postponementReason;
            break;

        default:
            throw new BadRequestException('Estado no válido');
        }

        return assembly.save();
    }

    // 6️⃣ ELIMINAR
    async delete(id: string, user: any): Promise<void> {
        const assembly = await this.assemblyModel.findById(id);
        if (!assembly) throw new NotFoundException('Asamblea no encontrada');

        if (!this.canManageAssembly(assembly, user)) {
        throw new ForbiddenException('No tienes permiso para eliminar esta asamblea');
        }

        if (assembly.status === 'Completada') {
        throw new BadRequestException('No se puede eliminar una asamblea completada');
        }

        await this.assemblyModel.findByIdAndDelete(id);
    }

    // 7️⃣ HELPER: Validar permisos
    private canManageAssembly(assembly: AssemblyDocument, user: any): boolean {
        if ([Role.Admin, Role.President, Role.SecretaryGeneral].includes(user.role)) return true;

        if (user.role === Role.Representative) {
        if (assembly.type === 'general') return false;
        return assembly.type === 'floor' && assembly.floor === user.floor;
        }

        return false;
    }

    // 8️⃣ HELPER: Obtener asambleas por piso
    async findByFloor(floor: number): Promise<AssemblyDocument[]> {
        return this.assemblyModel.find({
        $or: [{ type: 'general' }, { type: 'floor', floor }],
        });
    }

    // 9️⃣ HELPER: Obtener asambleas por estado
    async findByStatus(status: string, user?: any): Promise<AssemblyDocument[]> {
        let query = this.assemblyModel.find({ status });

        if (user && (user.role === Role.Resident || user.role === Role.Representative)) {
        query = query.find({
            $or: [{ type: 'general' }, { type: 'floor', floor: user.floor }],
        });
        }

        return query.exec();
    }
    }
