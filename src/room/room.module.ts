import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { RoomService } from './room.service';
import { RoomController } from './controller/room.controller';
import { Room, RoomSchema } from '../room/schema/room.schema';
import { Resident, ResidentSchema } from '../resident/schema/resident.schema';
import { Service, ServiceSchema } from '../service/schema/service.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Room.name, schema: RoomSchema },
      { name: Resident.name, schema: ResidentSchema },
      { name: Service.name, schema: ServiceSchema },
    ]),
  ],
  providers: [RoomService],
  controllers: [RoomController],
  exports: [RoomService],
})
export class RoomModule {}
