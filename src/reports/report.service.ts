import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Report, ReportDocument } from '../reports/schema/report.schema';
import { CreateReportDto } from './dto/create-report.dto';
import { UpdateReportDto } from './dto/update-report.dto';
import { ReportResponseDto } from './dto/report-response.dto';

@Injectable()
export class ReportsService {
  constructor(
    @InjectModel(Report.name) private readonly reportModel: Model<ReportDocument>,
  ) {}

  private toResponse(doc: ReportDocument): ReportResponseDto {
    return {
      _id: doc._id.toString(),
      resident: doc.populated('resident')
        ? {
            _id: (doc.resident as any)._id.toString(),
            fullName: (doc.resident as any).fullName ?? '',
            idNumber: (doc.resident as any).idNumber ?? '',
          }
        : doc.resident
        ? { _id: (doc.resident as any).toString(), fullName: '', idNumber: '' }
        : null,
      date: doc.date,
      reason: doc.reason,
      actionTaken: doc.actionTaken,
    };
  }

  /** 🔐 Solo "representante" puede crear (validación de rol la hace el guard) */
  async create(dto: CreateReportDto, userId: string): Promise<ReportResponseDto> {
    const created = await this.reportModel.create({
      ...dto,
      // si quieres forzar que el autor sea el mismo que "resident", valida aquí:
      // resident: userId,
    });
    const saved = await created.populate('resident', 'fullName idNumber');
    return this.toResponse(saved as ReportDocument);
  }

  async findAll(): Promise<ReportResponseDto[]> {
    const list = await this.reportModel
      .find()
      .sort({ createdAt: -1 })
      .populate('resident', 'fullName idNumber')
      .exec();
    return list.map((d) => this.toResponse(d));
  }

  async findById(id: string): Promise<ReportResponseDto> {
    const doc = await this.reportModel
      .findById(id)
      .populate('resident', 'fullName idNumber')
      .exec();
    if (!doc) throw new NotFoundException('Report not found');
    return this.toResponse(doc);
  }

  async findByResident(residentId: string, reqUser: { userId: string; role: string }): Promise<ReportResponseDto[]> {
    // Ejemplo de restricción: si es "resident", solo puede ver sus propios reportes
    if (reqUser.role === 'resident' && reqUser.userId !== residentId) {
      throw new ForbiddenException('Access denied');
    }
    const list = await this.reportModel
      .find({ resident: residentId })
      .populate('resident', 'fullName idNumber')
      .exec();
    return list.map((d) => this.toResponse(d));
  }

  async update(id: string, dto: UpdateReportDto): Promise<ReportResponseDto> {
    const updated = await this.reportModel
      .findByIdAndUpdate(id, dto, { new: true })
      .populate('resident', 'fullName idNumber')
      .exec();
    if (!updated) throw new NotFoundException('Report not found');
    return this.toResponse(updated);
  }

  async remove(id: string): Promise<void> {
    const deleted = await this.reportModel.findByIdAndDelete(id).exec();
    if (!deleted) throw new NotFoundException('Report not found');
  }
}
