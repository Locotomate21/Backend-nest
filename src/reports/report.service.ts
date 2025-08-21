import { Injectable, NotFoundException, ForbiddenException, BadRequestException, HttpException, HttpStatus } from '@nestjs/common';
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

  // Util: compara un campo que puede ser ObjectId o documento populado
  private sameId(a: unknown, b: string): boolean {
    if (!a || !b) return false;
    if (typeof a === 'string') return a === b;
    // @ts-ignore
    const idA: Types.ObjectId | string | undefined = a?._id ?? a;
    return idA?.toString?.() === b;
  }

  // Ensambla la respuesta con el residente populado
  private toResponseDto(report: ReportDocument): ReportResponseDto {
    const r: any = report as any;
    let resident: any = null;

    if (r.resident) {
      if (r.resident._id) {
        resident = {
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
        };
      } else {
        // caso donde solo es ObjectId
        resident = { _id: r.resident.toString() };
      }
    }

    return {
      _id: report._id.toString(),
      resident,
      date: report.date,
      reason: report.reason,
      actionTaken: report.actionTaken,
    };
  }


  // ✅ CREATE
  async create(dto: CreateReportDto, createdBy: string): Promise<ReportResponseDto> {
    const residentExists = await this.residentModel.exists({ _id: dto.resident });
    if (!residentExists) {
      throw new BadRequestException('Resident does not exist');
    }

    const created = new this.reportModel({
      ...dto,
      createdBy: new Types.ObjectId(createdBy),
      date: new Date(),
    });

    const saved = await created.save();
    await saved.populate(
      {
        path: 'resident',
        select: 'fullName idNumber',
        populate: {
          path: 'room',
          select: 'number floor',
        },
      }
    );

    return this.toResponseDto(saved);
  }

// ✅ FIND ALL
async findAll(user: { sub: string; role: Role }): Promise<ReportResponseDto[]> {
  let query;

  if (user.role === Role.Admin) {
    query = this.reportModel.find();
  } else if (user.role === Role.Resident) {
    query = this.reportModel.find({ resident: new Types.ObjectId(user.sub) });
  } else if (user.role === Role.Representative) {
    // buscamos al representante y obtenemos su piso
    const rep = await this.residentModel
      .findById(user.sub)
      .populate('room', 'floor')
      .exec();

    if (!rep?.room) {
      throw new ForbiddenException('Representative has no assigned floor');
    }

    const repFloor = (rep.room as any).floor;
    // buscamos todos los reportes de residentes que estén en ese piso
    query = this.reportModel.find().populate({
      path: 'resident',
      select: 'fullName idNumber room',
      populate: {
        path: 'room',
        select: 'number floor',
        match: { floor: repFloor },
      },
    });
  } else {
    throw new ForbiddenException('You do not have permission to view reports');
  }

  const reports = await query
    .populate({
      path: 'resident',
      select: 'fullName idNumber room',
      populate: { path: 'room', select: 'number floor' },
    })
    .exec();

  // ⚠️ filtramos los null porque puede haber residentes de otros pisos
  const filtered = reports.filter((r: any) => r.resident?.room);
  return filtered.map((r) => this.toResponseDto(r));
}


// ✅ FIND BY RESIDENT
async findByResident(residentId: string, user: { sub: string; role: Role }): Promise<ReportResponseDto[]> {
  if (user.role === Role.Admin) {
    const reports = await this.reportModel
      .find({ resident: residentId })
      .populate('resident', 'fullName idNumber room')
      .exec();
    return reports.map((r) => this.toResponseDto(r));
  }

  if (user.role === Role.Resident) {
    if (residentId !== user.sub) throw new ForbiddenException('Residents can only view their own reports');
    const reports = await this.reportModel
      .find({ resident: user.sub })
      .populate('resident', 'fullName idNumber room')
      .exec();
    return reports.map((r) => this.toResponseDto(r));
  }

  if (user.role === Role.Representative) {
    // buscamos al representante y su piso
    const rep = await this.residentModel
      .findById(user.sub)
      .populate('room', 'floor')
      .exec();

    if (!rep?.room) {
      throw new ForbiddenException('Representative has no assigned floor');
    }
    const repFloor = (rep.room as any).floor;

    // buscamos al residente y confirmamos que pertenezca al mismo piso
    const targetResident = await this.residentModel
      .findById(residentId)
      .populate('room', 'floor')
      .exec();

    if (!targetResident?.room || (targetResident.room as any).floor !== repFloor) {
      throw new ForbiddenException('You can only view reports from your floor');
    }

    const reports = await this.reportModel
      .find({ resident: residentId })
      .populate('resident', 'fullName idNumber room')
      .exec();

    return reports.map((r) => this.toResponseDto(r));
  }

  throw new ForbiddenException('You do not have permission to view reports');
}

  // ✅ UPDATE
  async update(id: string, dto: UpdateReportDto, user: { sub: string; role: Role }): Promise<ReportResponseDto> {
    const report = await this.reportModel.findById(id).exec();
    if (!report) throw new NotFoundException('Report not found');

    const canUpdate = user.role === Role.Admin || 
      (user.role === Role.Representative && this.sameId((report as any).createdBy, user.sub));

    if (!canUpdate) throw new ForbiddenException('You are not allowed to update this report');

    // Validar que si se cambia el resident, exista
    if (dto.resident) {
      const residentExists = await this.residentModel.exists({ _id: dto.resident });
      if (!residentExists) throw new BadRequestException('Resident does not exist');
    }

    Object.assign(report, dto);
    const updated = await report.save();
    await updated.populate('resident', 'fullName idNumber');

    return this.toResponseDto(updated);
  }

  // ✅ DELETE
  async remove(id: string, user: { sub: string; role: Role }): Promise<void> {
    const report = await this.reportModel.findById(id).exec();
    if (!report) throw new NotFoundException('Report not found');

    const canDelete =
      user.role === Role.Admin ||
      (user.role === Role.Representative && this.sameId((report as any).createdBy, user.sub));

    if (!canDelete) throw new ForbiddenException('You are not allowed to delete this report');

    await this.reportModel.findByIdAndDelete(id).exec();
  }

  async findById(id: string, user: { sub: string; role: Role }): Promise<ReportResponseDto> {
  const report = await this.reportModel
    .findById(id)
    .populate({
      path: 'resident',
      populate: { path: 'room' },
    })
    .exec();

  if (!report) {
    throw new HttpException('Report not found', HttpStatus.NOT_FOUND);
  }

  // 🔹 Restricciones según rol
  if (user.role === Role.Representative && !this.sameId(report.resident, user.sub)) {
    throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
  }
  if (user.role === Role.Resident && !this.sameId(report.resident, user.sub)) {
    throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
  }

  return this.toResponseDto(report);
}

}

