    import { Injectable, ForbiddenException } from '@nestjs/common';
    import { InjectModel } from '@nestjs/mongoose';
    import { Model } from 'mongoose';
    import { Assembly, AssemblyDocument } from './schema/assembly.schema';
    import { CreateAssemblyDto } from './dto/create-assembly.dto';
    import { Role } from '../common/roles.enum';

    @Injectable()
    export class AssembliesService {
    constructor(@InjectModel(Assembly.name) private assemblyModel: Model<AssemblyDocument>) {}

    // Crear
    async create(dto: CreateAssemblyDto, user: any) {
        if (![Role.Admin, Role.Representative].includes(user.role)) {
        throw new ForbiddenException('No tienes permiso para crear asambleas');
        }

        if (dto.type === 'floor') {
        if (user.role !== Role.Representative) {
            throw new ForbiddenException('Solo los representantes pueden crear asambleas de piso');
        }
        dto.floor = user.floor; // asigna el piso del representante automáticamente
        }

        const assembly = new this.assemblyModel({
        ...dto,
        createdBy: user.fullName,
        });

        return assembly.save();
    }

    // Obtener todas (filtradas por tipo y piso)
    async findAll(user: any) {
        if (user.role === Role.Resident || user.role === Role.Representative) {
        return this.assemblyModel.find({
            $or: [
            { type: 'general' },
            { type: 'floor', floor: user.floor },
            ],
        });
        }
        return this.assemblyModel.find(); // Admin ve todo
    }

    // Obtener por ID
    async findOne(id: string, user: any) {
        const assembly = await this.assemblyModel.findById(id);
        if (!assembly) return null;

        if (assembly.type === 'floor' && assembly.floor !== user.floor && user.role !== Role.Admin) {
        throw new ForbiddenException('No tienes permiso para ver esta asamblea');
        }

        return assembly;
    }

    // Borrar
    async delete(id: string, user: any) {
        const assembly = await this.assemblyModel.findById(id);
        if (!assembly) return null;

        if (assembly.createdBy !== user.fullName && user.role !== Role.Admin) {
        throw new ForbiddenException('No tienes permiso para eliminar esta asamblea');
        }

        return this.assemblyModel.findByIdAndDelete(id);
    }
    }
