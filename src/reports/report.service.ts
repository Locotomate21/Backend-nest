import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Report, ReportDocument } from '../reports/schema/report.schema';
import { CreateReportDto } from '../reports/dto/create-report.dto';
import { UpdateReportDto } from '../reports/dto/update-report.dto';
import { ReportResponseDto } from '../reports/dto/report-response.dto';
import { User } from '../users/schema/user.schema';
import { Resident } from '../resident/schema/resident.schema';

@Injectable()
export class ReportService {
  constructor(
    @InjectModel(Report.name) private reportModel: Model<Report>,
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Resident.name) private residentModel: Model<Resident>,
  ) {}

  // ------------------------
  // Helper para extraer el ID de la room
  // ------------------------
  private getRoomId(room: any): string | null {
    if (!room) return null;
    if (Types.ObjectId.isValid(room)) return room.toString();
    if (room._id) return room._id.toString();
    return null;
  }

  // ------------------------
  // DTO Mapper
  // ------------------------
  private toResponseDto(report: ReportDocument): ReportResponseDto {
    const r: any = report as any;

    const resident = r.resident?._id
      ? {
          _id: r.resident._id.toString(),
          fullName: r.resident.fullName ?? '',
          idNumber: r.resident.idNumber ?? '',
          studentCode: r.resident.studentCode ?? '',
          room: r.resident.room
            ? {
                _id: this.getRoomId(r.resident.room),
                number: r.resident.room.number,
                floor: r.resident.room.floor,
              }
            : null,
        }
      : null;

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
                studentCode: r.createdBy.resident.studentCode ?? '',
                room: r.createdBy.resident.room
                  ? {
                      _id: this.getRoomId(r.createdBy.resident.room),
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
      createdBy,
    };
  }

  // ------------------------
  // HELPER: Resolver residente
  // ------------------------
  private async resolveResident(residentInput: string | number): Promise<Resident> {
    let resident: Resident | null = null;

    // Si es número o string numérico → buscar por studentCode
    if (typeof residentInput === 'number' || /^\d+$/.test(residentInput)) {
      resident = await this.residentModel
        .findOne({ studentCode: Number(residentInput) })
        .populate('room');
    }
    // Si es ObjectId válido → buscar por _id
    else if (typeof residentInput === 'string' && Types.ObjectId.isValid(residentInput)) {
      resident = await this.residentModel.findById(residentInput).populate('room');
    }

    if (!resident) {
      throw new NotFoundException('Residente no encontrado');
    }

    return resident;
  }

  // ------------------------
  // CREATE
  // ------------------------
  async create(
    createReportDto: CreateReportDto,
    userId: string,
  ): Promise<ReportResponseDto> {
    console.log('=== DEBUG REPORT CREATE ===');
    console.log('Datos recibidos:', createReportDto);
    console.log('User ID:', userId);
    const user = await this.userModel.findById(userId).populate({
      path: 'resident',
      select: 'fullName studentCode room',
      populate: { path: 'room', select: 'number floor' },
    });

    if (!user) throw new NotFoundException('Usuario no encontrado');

    if (!['representative', 'president'].includes(user.role)) {
      throw new ForbiddenException('No tienes permiso para crear reportes');
    }

    // Resolver residente
    const resident = await this.resolveResident(
      createReportDto.resident ?? createReportDto.studentCode ?? '',
    );

    // 📌 Crear reporte siempre con la room del residente
    const createdReport = new this.reportModel({
      ...createReportDto,
      resident: resident._id,
      studentCode: resident.studentCode,
      room: this.getRoomId(resident.room),
      createdBy: user._id,
    });

    await createdReport.save();

    await createdReport.populate([
      {
        path: 'resident',
        select: 'fullName idNumber studentCode room',
        populate: { path: 'room', select: 'number floor' },
      },
      {
        path: 'createdBy',
        select: 'fullName email role resident',
        populate: {
          path: 'resident',
          select: 'fullName studentCode room',
          populate: { path: 'room', select: 'number floor' },
        },
      },
    ]);

    return this.toResponseDto(createdReport);
  }

  // ------------------------
  // FIND ALL
  // ------------------------
  async findAll(): Promise<ReportResponseDto[]> {
    const reports = await this.reportModel
      .find()
      .populate([
        {
          path: 'resident',
          select: 'fullName idNumber studentCode room',
          populate: { path: 'room', select: 'number floor' },
        },
        {
          path: 'createdBy',
          select: 'fullName email role resident',
          populate: {
            path: 'resident',
            select: 'fullName studentCode room',
            populate: { path: 'room', select: 'number floor' },
          },
        },
      ])
      .exec();

    return reports.map((r) => this.toResponseDto(r));
  }

  // ------------------------
  // FIND BY RESIDENT
  // ------------------------
  async findByResident(residentId: string): Promise<ReportResponseDto[]> {
    const resident = await this.resolveResident(residentId);

    const reports = await this.reportModel
      .find({ resident: resident._id })
      .populate([
        {
          path: 'resident',
          select: 'fullName idNumber studentCode room',
          populate: { path: 'room', select: 'number floor' },
        },
        {
          path: 'createdBy',
          select: 'fullName email role resident',
          populate: {
            path: 'resident',
            select: 'fullName studentCode room',
            populate: { path: 'room', select: 'number floor' },
          },
        },
      ])
      .exec();

    return reports.map((r) => this.toResponseDto(r));
  }

  // ------------------------
  // FIND BY ID
  // ------------------------
  async findById(id: string): Promise<ReportResponseDto> {
    const report = await this.reportModel.findById(id).populate([
      {
        path: 'resident',
        select: 'fullName idNumber studentCode room',
        populate: { path: 'room', select: 'number floor' },
      },
      {
        path: 'createdBy',
        select: 'fullName email role resident',
        populate: {
          path: 'resident',
          select: 'fullName studentCode room',
          populate: { path: 'room', select: 'number floor' },
        },
      },
    ]);

    if (!report) throw new NotFoundException('Reporte no encontrado');

    return this.toResponseDto(report);
  }

  // ------------------------
  // UPDATE
  // ------------------------
  async update(
    id: string,
    updateReportDto: UpdateReportDto,
  ): Promise<ReportResponseDto> {
    const updateData: any = { ...updateReportDto };

    if (updateData.resident) {
      const resident = await this.resolveResident(updateData.resident);

      if (
        updateData.room &&
        resident.room &&
        this.getRoomId(resident.room) !== updateData.room
      ) {
        throw new ForbiddenException(
          'La habitación no coincide con la asignada al residente',
        );
      }

      updateData.resident = resident._id;
      updateData.studentCode = resident.studentCode;
      updateData.room = this.getRoomId(resident.room);
    }

    const updatedReport = await this.reportModel.findByIdAndUpdate(
      id,
      updateData,
      { new: true },
    );

    if (!updatedReport) throw new NotFoundException('Reporte no encontrado');

    await updatedReport.populate([
      {
        path: 'resident',
        select: 'fullName idNumber studentCode room',
        populate: { path: 'room', select: 'number floor' },
      },
      {
        path: 'createdBy',
        select: 'fullName email role resident',
        populate: {
          path: 'resident',
          select: 'fullName studentCode room',
          populate: { path: 'room', select: 'number floor' },
        },
      },
    ]);

    return this.toResponseDto(updatedReport);
  }

  // ------------------------
  // DELETE
  // ------------------------
  async delete(id: string): Promise<void> {
    const result = await this.reportModel.findByIdAndDelete(id);
    if (!result) throw new NotFoundException('Reporte no encontrado');
  }
}
