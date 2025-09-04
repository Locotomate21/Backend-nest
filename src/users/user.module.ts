import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from '../users/schema/user.schema';
import { UserService } from './user.service';
import { UserController } from './controller/user.controller';
import { RoomModule } from '../room/room.module'; // 👈 importar RoomModule

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'User', schema: UserSchema }]),
    RoomModule, // 👈 ahora UserService puede usar RoomService
  ],
  providers: [UserService],
  controllers: [UserController],
  exports: [UserService],
})
export class UserModule {}
