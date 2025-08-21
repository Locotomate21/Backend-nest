import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ResidentService } from './resident.service';
import { ResidentController } from './controller/resident.controller';
import { Resident, ResidentSchema } from './schema/resident.schema';
import { User, UserSchema } from '../users/schema/user.schema';
import { RoomModule } from '../room/room.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Resident.name, schema: ResidentSchema },
      {name: User.name, schema: UserSchema},
    ]),
    forwardRef(() => RoomModule),
    RoomModule,
  ],
  controllers: [ResidentController],
  providers: [ResidentService],
  exports: [
    ResidentService,
    MongooseModule.forFeature([
      { name: Resident.name, schema: ResidentSchema },
      {name: User.name, schema: UserSchema},
    ]), 
  ],
})
export class ResidentModule {}
