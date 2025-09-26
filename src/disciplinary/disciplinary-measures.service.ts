    import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
    import { InjectModel } from '@nestjs/mongoose';
    import { Model, Types } from 'mongoose';
    import { DisciplinaryMeasure, DisciplinaryMeasureDocument } from './schema/disciplinary-measure.schema';
    import { CreateDisciplinaryMeasureDto } from './dto/create-disciplinary-measure.dto';
    import { UpdateDisciplinaryMeasureDto } from './dto/update-disciplinary-measure.dto';
    import { Resident, ResidentDocument } from '../resident/schema/resident.schema';
    import { Role } from '../common/roles.enum';

    @Injectable()
    export class DisciplinaryMeasuresService {
    constructor(
        @InjectModel(DisciplinaryMeasure.name)
        private readonly disciplinaryMeasureModel: Model<DisciplinaryMeasureDocument>,
        @InjectModel(Resident.name)
        private readonly residentModel: Model<ResidentDocument>,
    ) {}

    // 👉 Crear medida
    async create(dto: CreateDisciplinaryMeasureDto, user: any) {
        // Buscar residente por studentCode en vez de _id
        const resident = await this.residentModel
        .findOne({ studentCode: dto.studentCode })
        .populate({ path: 'room', select: 'floor' })
        .exec();

        if (!resident) throw new NotFoundException('Residente no encontrado');

        // Validar piso si el rol es auditor/representante
        if (user.role === Role.FloorAuditor || user.role === Role.Representative) {
        const residentFloor = (resident.room as any)?.floor;
        if (residentFloor === undefined) {
            throw new ForbiddenException('No se puede determinar el piso del residente');
        }
        if (Number(residentFloor) !== Number(user.floor)) {
            throw new ForbiddenException('No puedes poner medidas a residentes de otro piso');
        }
        }

        const created = new this.disciplinaryMeasureModel({
        ...dto,
        residentId: resident._id, // 👈 guardamos el ObjectId real
        createdBy: new Types.ObjectId(user.id),
        });

        return created.save();
    }

    // 👉 Obtener todas las medidas (según rol)
    async findAll(user: any) {
        let filter: any = {};

        if (
        user.role !== Role.President &&
        user.role !== Role.GeneralAuditor &&
        user.role !== Role.Representative &&
        user.role !== Role.FloorAuditor
        ) {
        throw new ForbiddenException('Solo cargos autorizados pueden ver medidas');
        } else {
        const residentsOnFloor = await this.residentModel
            .find({})
            .populate({ path: 'room', select: 'floor' })
            .exec();

        const residentIds = residentsOnFloor
            .filter((r) => {
            const floor = (r.room as any)?.floor;
            return floor && Number(floor) === Number(user.floor);
            })
            .map((r) => r._id);

        filter = { residentId: { $in: residentIds } };
        }

        return this.disciplinaryMeasureModel
        .find(filter)
        .populate('residentId', 'fullName room studentCode')
        .populate('createdBy', 'fullName role')
        .populate('resolvedBy', 'fullName role')
        .exec();
    }

    // 👉 Buscar por ID de la medida
    async findOne(id: string) {
        const measure = await this.disciplinaryMeasureModel
        .findById(new Types.ObjectId(id))
        .populate('residentId', 'fullName room studentCode')
        .populate('createdBy', 'fullName role')
        .populate('resolvedBy', 'fullName role')
        .exec();

        if (!measure) throw new NotFoundException('Medida no encontrada');
        return measure;
    }

    // 👉 Buscar por residente usando studentCode
    async findByResident(studentCode: number) {
        const resident = await this.residentModel.findOne({ studentCode }).exec();
        if (!resident) throw new NotFoundException('Residente no encontrado');

        return this.disciplinaryMeasureModel
        .find({ residentId: resident._id })
        .populate('residentId', 'fullName room studentCode')
        .populate('createdBy', 'fullName role')
        .populate('resolvedBy', 'fullName role')
        .exec();
    }

    // 👉 Actualizar medida
    async update(id: string, dto: UpdateDisciplinaryMeasureDto, user: any) {
        const measure = await this.disciplinaryMeasureModel.findById(new Types.ObjectId(id));
        if (!measure) throw new NotFoundException('Medida no encontrada');

        if (dto.status === 'Resuelta') {
        if (
            user.role === Role.President ||
            user.role === Role.GeneralAuditor ||
            user.role === Role.Representative ||
            user.role === Role.FloorAuditor
        ) {
            if (!measure.resolvedBy) {
            measure.resolvedBy = new Types.ObjectId(user.id);
            }
        } else {
            throw new ForbiddenException('No tienes permisos para resolver esta medida');
        }
        }

        Object.assign(measure, dto);
        return measure.save();
    }

    // 👉 Eliminar medida
    async remove(id: string) {
        const result = await this.disciplinaryMeasureModel.findByIdAndDelete(new Types.ObjectId(id));
        if (!result) throw new NotFoundException('Medida no encontrada');
        return { message: 'Medida eliminada correctamente' };
    }
    }
