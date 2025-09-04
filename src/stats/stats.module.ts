import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { StatsService } from './stats.service';
import { StatsController } from '../stats/controller/stats.controller';
import { Room, RoomSchema } from '../room/schema/room.schema';
import { Resident, ResidentSchema } from '../resident/schema/resident.schema';
import { Report, ReportSchema } from '../reports/schema/report.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Room.name, schema: RoomSchema },
      { name: Resident.name, schema: ResidentSchema },
      { name: Report.name, schema: ReportSchema },
    ]),
  ],
  controllers: [StatsController],
  providers: [StatsService],
})
export class StatsModule {}
