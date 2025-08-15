import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Room, RoomDocument } from '../room/schema/room.schema';
import { CreateRoomDto } from '../room/dto/create-room.dto';
import { UpdateRoomDto } from '../room/dto/update-room.dto';
import { RoomResponseDto } from '../room/dto/room-response.dto';
import { Resident } from '../resident/schema/resident.schema';
import { Service } from '../service/schema/service.schema';

@Injectable()
export class RoomService {
  constructor(
    @InjectModel(Room.name) private roomModel: Model<RoomDocument>,
    @InjectModel(Resident.name) private residentModel: Model<Resident>,
    @InjectModel(Service.name) private serviceModel: Model<Service>,
  ) {}

  /** 🔹 Convierte RoomDocument a RoomResponseDto */
  private toRoomResponseDto(room: RoomDocument): RoomResponseDto {
    return {
      _id: room._id.toString(),
      number: room.number,
      floor: room.floor,
      occupied: room.occupied,
      currentResident: room.currentResident
        ? typeof room.currentResident === 'object' && '_id' in room.currentResident
          ? {
              _id: (room.currentResident as any)._id.toString(),
              fullName: (room.currentResident as any).fullName || '',
              idNumber: (room.currentResident as any).idNumber || '',
            }
          : (room.currentResident as any).toString()
        : null,
      __v: room.__v ?? 0,
    };
  }

  /** 🔹 Crear habitación */
  async create(createRoomDto: CreateRoomDto): Promise<RoomResponseDto> {
    const createdRoom = new this.roomModel(createRoomDto);
    const saved = await createdRoom.save();
    return this.toRoomResponseDto(saved);
  }

  /** 🔹 Listar todas las habitaciones */
  async findAll(): Promise<RoomResponseDto[]> {
    const rooms = await this.roomModel
      .find()
      .populate('currentResident', 'fullName idNumber')
      .exec();

    return rooms.map((room) => this.toRoomResponseDto(room));
  }

  /** 🔹 Buscar una habitación por ID */
  async findOne(id: string): Promise<RoomResponseDto> {
    const room = await this.roomModel
      .findById(id)
      .populate('currentResident', 'fullName idNumber')
      .exec();

    if (!room) throw new NotFoundException('Room not found');
    return this.toRoomResponseDto(room);
  }

  /** 🔹 Actualizar habitación */
  async update(id: string, updateRoomDto: UpdateRoomDto): Promise<RoomResponseDto> {
    const updatedRoom = await this.roomModel
      .findByIdAndUpdate(id, updateRoomDto, { new: true })
      .populate('currentResident', 'fullName idNumber')
      .exec();

    if (!updatedRoom) throw new NotFoundException('Room not found');
    return this.toRoomResponseDto(updatedRoom);
  }

  /** 🔹 Eliminar habitación */
  async remove(id: string): Promise<void> {
    const deleted = await this.roomModel.findByIdAndDelete(id).exec();
    if (!deleted) throw new NotFoundException('Room not found');
  }

  /** 🔹 Obtener servicios de una habitación */
  async getRoomService(roomId: string) {
    const room = await this.roomModel.findById(roomId).exec();
    if (!room) throw new NotFoundException('Room not found');

    return this.serviceModel.find({ room: new Types.ObjectId(roomId) }).exec();
  }

  /** 🔹 Sincronizar ocupación con residentes */
  async syncOccupancy(): Promise<void> {
    const residents = await this.residentModel.find({ active: true }).exec();
    const updates = residents.map((resident) =>
      this.roomModel.findByIdAndUpdate(resident.room, {
        occupied: true,
        currentResident: resident._id,
      }),
    );

    await Promise.all(updates);
  }
}
