import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Report, ReportDocument } from './schema/report.schema';
import { CreateReportDto } from './dto/create-report.dto';
import { UpdateReportDto } from './dto/update-report.dto';
import { ReportResponseDto } from './dto/report-response.dto';
import { Role } from '../common/roles.enum';
import { Resident } from '../resident/schema/resident.schema';

@Injectable()
export class ReportsService {
  constructor(
    @InjectModel(Report.name) private reportModel: Model<Report>,
    @InjectModel(Resident.name) private residentModel: Model<Resident>,
  ) {}

  // Utilidad: compara un campo que puede ser ObjectId o documento populado
  private sameId(a: unknown, b: string): boolean {
    if (!a || !b) return false;
    if (typeof a === 'string') return a === b;
    const idA: Types.ObjectId | string | undefined = (a as any)?._id ?? a;
    return idA?.toString?.() === b;
  }

  // ✅ CREATE
  async create(dto: CreateReportDto, user: any): Promise<ReportResponseDto> {
/*     console.log('USER EN REPORT SERVICE:', user); */
    const residentExists = await this.residentModel.exists({ _id: dto.resident });
    if (!residentExists) {
      throw new BadRequestException('Resident does not exist');
    }

    const created = new this.reportModel({
      ...dto,
      resident: new Types.ObjectId(dto.resident),
      createdBy: user._id,
      date: new Date(),
    });

    const saved = await created.save();

    await saved.populate([
      {
        path: 'resident',
        select: 'fullName idNumber room',
        populate: { path: 'room', select: 'number floor' },
      },
      {
        path: 'createdBy',
        select: 'fullName email role resident',
        populate: {
          path: 'resident',
          select: 'fullName room',
          populate: { path: 'room', select: 'number floor' },
        },
      },
    ]);

    return this.toResponseDto(saved);
  }

  // Mapper → ResponseDTO
  private toResponseDto(report: ReportDocument): ReportResponseDto {
    const r: any = report as any;

    // Resident
    const resident = r.resident?._id
      ? {
          _id: r.resident._id.toString(),
          fullName: r.resident.fullName ?? '',
          idNumber: r.resident.idNumber ?? '',
          room: r.resident.room
            ? {
                _id: r.resident.room._id.toString(),
                number: r.resident.room.number,
                floor: r.resident.room.floor,
              }
            : null,
        }
      : null;

    // CreatedBy
    const createdBy = r.createdBy?._id
      ? {
          _id: r.createdBy._id.toString(),
          fullName: r.createdBy.fullName ?? '',
          email: r.createdBy.email ?? '',
          role: r.createdBy.role ?? '',
          resident: r.createdBy.resident?._id
            ? {
                _id: r.createdBy.resident._id.toString(),
                fullName: r.createdBy.resident.fullName ?? '',
                room: r.createdBy.resident.room
                  ? {
                      _id: r.createdBy.resident.room._id.toString(),
                      number: r.createdBy.resident.room.number,
                      floor: r.createdBy.resident.room.floor,
                    }
                  : null,
              }
            : null,
        }
      : null;

    return {
      _id: r._id.toString(),
      resident,
      date: r.date,
      reason: r.reason,
      actionTaken: r.actionTaken,
      createdBy: createdBy!,
    };
  }

  // ✅ FIND ALL
  async findAll(user: { sub: string; role: Role; floor?: number }): Promise<ReportResponseDto[]> {
  let query = this.reportModel.find();

  if (user.role === Role.Resident) {
    query = this.reportModel.find({ resident: new Types.ObjectId(user.sub) });
  } else if (user.role === Role.Representative) {
    const repFloor = user.floor;
    if (!repFloor) throw new ForbiddenException('Representative has no assigned floor');

    const reports = await this.reportModel
      .find()
      .populate({
        path: 'resident',
        select: 'fullName idNumber room',
        populate: { path: 'room', select: 'number floor' },
      })
      .populate({
        path: 'createdBy',
        select: 'fullName email role resident',
        populate: {
          path: 'resident',
          select: 'fullName room',
          populate: { path: 'room', select: 'number floor' },
        },
      })
      .exec();

    return reports
      .filter((r: any) => r.resident?.room?.floor === repFloor)
      .map((r) => this.toResponseDto(r));
  } else if (user.role !== Role.Admin) {
    throw new ForbiddenException('You do not have permission to view reports');
  }

  const reports = await query
    .populate({
      path: 'resident',
      select: 'fullName idNumber room',
      populate: { path: 'room', select: 'number floor' },
    })
    .populate({
      path: 'createdBy',
      select: 'fullName email role resident',
      populate: {
        path: 'resident',
        select: 'fullName room',
        populate: { path: 'room', select: 'number floor' },
      },
    })
    .exec();

  return reports.map((r) => this.toResponseDto(r));
}

  // ✅ FIND BY RESIDENT
  async findByResident(
    residentId: string,
    user: { sub: string; role: Role },
  ): Promise<ReportResponseDto[]> {
    if (user.role === Role.Admin || (user.role === Role.Resident && residentId === user.sub)) {
      const reports = await this.reportModel
        .find({ resident: residentId })
        .populate({
          path: 'resident',
          select: 'fullName idNumber room',
          populate: { path: 'room', select: 'number floor' },
        })
        .exec();
      return reports.map((r) => this.toResponseDto(r));
    }

    if (user.role === Role.Resident && residentId !== user.sub) {
      throw new ForbiddenException('Residents can only view their own reports');
    }

    if (user.role === Role.Representative) {
      const rep = await this.residentModel
        .findById(user.sub)
        .populate('room', 'floor')
        .exec() as any;

      const repFloor = rep?.room?.floor;
      if (!repFloor) throw new ForbiddenException('Representative has no assigned floor');

      const resident = await this.residentModel
        .findById(residentId)
        .populate('room', 'floor')
        .exec() as any;

      if (!resident) throw new NotFoundException('Resident not found');
      if (resident?.room?.floor !== repFloor) {
        throw new ForbiddenException('This resident does not belong to your floor');
      }

      const reports = await this.reportModel
        .find({ resident: residentId })
        .populate({
          path: 'resident',
          select: 'fullName idNumber room',
          populate: { path: 'room', select: 'number floor' },
        })
        .exec();

      return reports.map((r) => this.toResponseDto(r));
    }

    throw new ForbiddenException('Unauthorized role');
  }

  // ✅ UPDATE
  async update(
    id: string,
    dto: UpdateReportDto,
    user: { sub: string; role: Role },
  ): Promise<ReportResponseDto> {
    const report = await this.reportModel.findById(id).exec();
    if (!report) throw new NotFoundException('Report not found');

    const canUpdate =
      user.role === Role.Admin ||
      (user.role === Role.Representative && this.sameId((report as any).createdBy, user.sub));

    if (!canUpdate) throw new ForbiddenException('You are not allowed to update this report');

    if (dto.resident) {
      const residentExists = await this.residentModel.exists({ _id: dto.resident });
      if (!residentExists) throw new BadRequestException('Resident does not exist');
    }

    Object.assign(report, dto);
    const updated = await report.save();

    await updated.populate({
      path: 'resident',
      select: 'fullName idNumber room',
      populate: { path: 'room', select: 'number floor' },
    });

    return this.toResponseDto(updated);
  }

// ✅ DELETE
async remove(id: string, user: { _id: string; role: Role; floor: number }): Promise<void> {
  const report = await this.reportModel
    .findById(id)
    .populate({
      path: 'resident',
      select: 'room',
      populate: { path: 'room', select: 'floor' }
    })
    .exec();

  if (!report) throw new NotFoundException('Report not found');

  let canDelete = false;

  if (user.role === Role.Admin) {
    canDelete = true;
  } else if (user.role === Role.Representative) {
    const createdByMatches = this.sameId((report as any).createdBy, user._id);

    // ⬇️ Verificamos que el residente del reporte tenga un room con floor
    const residentFloor = (report as any).resident?.room?.floor;

    const isSameFloor = residentFloor && user.floor === residentFloor;

    canDelete = createdByMatches || isSameFloor;
  }

  if (!canDelete) throw new ForbiddenException('You are not allowed to delete this report');

  await this.reportModel.findByIdAndDelete(id).exec();
}

 // ✅ FIND BY ID
async findById(id: string, user: { sub: string; role: Role; floor?: number }): Promise<ReportResponseDto> {
  const report = await this.reportModel
    .findById(id)
    .populate({
      path: 'resident',
      select: 'fullName idNumber room',
      populate: { path: 'room', select: 'number floor' },
    })
    .populate({
      path: 'createdBy',
      select: 'fullName email role resident',
      populate: {
        path: 'resident',
        select: 'fullName room',
        populate: { path: 'room', select: 'number floor' },
      },
    })
    .exec();

  if (!report) throw new NotFoundException('Report not found');

  if (user.role === Role.Admin) return this.toResponseDto(report);

  if (user.role === Role.Resident) {
    if (!this.sameId(report.resident, user.sub)) {
      throw new ForbiddenException('Residents can only view their own reports');
    }
    return this.toResponseDto(report);
  }

  if (user.role === Role.Representative) {
    // 1️⃣ Intentar usar el floor del JWT (ya viene en user.floor)
    let repFloor = user.floor;

    // 2️⃣ Fallback: si no está en el JWT, consultamos DB
    if (!repFloor) {
      const rep = await this.residentModel
        .findById(user.sub)
        .populate('room', 'floor')
        .exec() as any;
      repFloor = rep?.room?.floor;
    }

    if (!repFloor) throw new ForbiddenException('Representative has no assigned floor');

    const residentFloor = (report.resident as any)?.room?.floor;
    if (residentFloor !== repFloor) {
      throw new ForbiddenException('Report does not belong to your floor');
    }

    return this.toResponseDto(report);
  }

  throw new ForbiddenException('Unauthorized role');
}

}