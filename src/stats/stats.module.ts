import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { StatsService } from './stats.service';
import { StatsController } from './controller/stats.controller';
import { Room, RoomSchema } from '../room/schema/room.schema';
import { Resident, ResidentSchema } from '../resident/schema/resident.schema';
import { Report, ReportSchema } from '../reports/schema/report.schema';
import { Assembly, AssemblySchema } from '../assemblies/schema/assembly.schema';
import { DisciplinaryMeasure, DisciplinaryMeasureSchema } from '../disciplinary/schema/disciplinary-measure.schema';
import { News, NewsSchema } from '../news/schema/news.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Room.name, schema: RoomSchema },
      { name: Resident.name, schema: ResidentSchema },
      { name: Report.name, schema: ReportSchema },
      { name: Assembly.name, schema: AssemblySchema },  // ✅ AGREGADO
      { name: DisciplinaryMeasure.name, schema: DisciplinaryMeasureSchema },
      { name: News.name, schema: NewsSchema },
    ]),
  ],
  providers: [StatsService],
  controllers: [StatsController],
  exports: [StatsService],
})
export class StatsModule {}