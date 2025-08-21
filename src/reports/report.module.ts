import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ReportsService } from './report.service';
import { ReportsController } from './controller/report.controller';
import { Report, ReportSchema } from './schema/report.schema';
import { ResidentModule } from '../resident/resident.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Report.name, schema: ReportSchema }]),
    ResidentModule, // 🔹 importar para poder usar ResidentModel
  ],
  controllers: [ReportsController],
  providers: [ReportsService],
  exports: [ReportsService],

})
export class ReportModule {}
