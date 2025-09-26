import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ReportService } from './report.service';
import { ReportController } from './controller/report.controller';
import { Report, ReportSchema } from './schema/report.schema';
import { ResidentModule } from '../resident/resident.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Report.name, schema: ReportSchema }]),
    ResidentModule, // 🔹 importar para poder usar ResidentModel
  ],
  controllers: [ReportController],
  providers: [ReportService],
  exports: [ReportService],

})
export class ReportModule {}
