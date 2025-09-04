import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types, isValidObjectId } from 'mongoose';
import { Room, RoomDocument } from '../room/schema/room.schema';
import { CreateRoomDto } from '../room/dto/create-room.dto';
import { UpdateRoomDto } from '../room/dto/update-room.dto';
import { RoomResponseDto } from '../room/dto/room-response.dto';
import { Resident } from '../resident/schema/resident.schema';
import { Service } from './schema/service.schema';

@Injectable()
export class RoomService {
  constructor(
    @InjectModel(Room.name) private roomModel: Model<RoomDocument>,
    @InjectModel(Resident.name) private residentModel: Model<Resident>,
    @InjectModel(Service.name) private serviceModel: Model<Service>,
  ) {}

  // ---------------------------------------------------------------------------
  // 🔹 Helpers privados
  // ---------------------------------------------------------------------------

  /** Convierte RoomDocument a RoomResponseDto */
  private toRoomResponseDto(room: RoomDocument): RoomResponseDto {
    const roomId = room._id as Types.ObjectId;

    return {
      _id: roomId.toString(),
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

  /** Verifica que un representative solo pueda acceder a su piso */
  private checkRepresentativeAccess(user: any, room: RoomDocument) {
    if (user.role === 'representative' && room.floor !== user.floor) {
      throw new ForbiddenException(
        `No tienes permiso para acceder a habitaciones del piso ${room.floor}`,
      );
    }
  }

  /** Valida que el número corresponda al piso */
  private ensureRoomNumberMatchesFloor(number: number, floor: number): void {
    const prefix = Math.floor(number / 100); // Ej: 201 -> 2
    const suffix = number % 100; // Ej: 201 -> 1

    if (floor === 1) {
      if (prefix !== 1 || suffix < 1 || suffix > 8) {
        throw new BadRequestException(
          `El número ${number} no corresponde al piso ${floor}. Válidos: 101–108.`,
        );
      }
      return;
    }

    if (floor >= 2 && floor <= 5) {
      if (prefix !== floor || suffix < 1 || suffix > 34) {
        throw new BadRequestException(
          `El número ${number} no corresponde al piso ${floor}. Válidos: ${floor}01–${floor}34.`,
        );
      }
      return;
    }

    throw new BadRequestException(
      `Floor ${floor} no está soportado (solo 1–5).`,
    );
  }

  /** Valida la capacidad máxima por piso */
  private async validateFloorCapacity(floor: number): Promise<void> {
    let maxRooms: number;

    if (floor === 1) {
      maxRooms = 8;
    } else if (floor >= 2 && floor <= 5) {
      maxRooms = 34;
    } else {
      throw new BadRequestException(
        `Floor ${floor} no está soportado (solo 1–5).`,
      );
    }

    const roomCount = await this.roomModel.countDocuments({ floor }).exec();
    if (roomCount >= maxRooms) {
      throw new BadRequestException(
        `El piso ${floor} ya alcanzó su capacidad máxima de ${maxRooms} habitaciones.`,
      );
    }
  }

  // ---------------------------------------------------------------------------
  // 🔹 Métodos públicos
  // ---------------------------------------------------------------------------

  /** Crear habitación */
  async create(
    createRoomDto: CreateRoomDto,
    user: any,
  ): Promise<RoomResponseDto> {
    if (user.role === 'representative' && createRoomDto.floor !== user.floor) {
      throw new ForbiddenException(
        'No puedes crear habitaciones en otro piso que no sea el tuyo',
      );
    }

    this.ensureRoomNumberMatchesFloor(
      createRoomDto.number,
      createRoomDto.floor,
    );
    await this.validateFloorCapacity(createRoomDto.floor);

    const createdRoom = new this.roomModel(createRoomDto);
    const saved = await createdRoom.save();
    return this.toRoomResponseDto(saved);
  }

  /** Listar todas las habitaciones */
  async findAll(user: any): Promise<RoomResponseDto[]> {
    let query = {};
    if (user.role === 'representative') {
      query = { floor: user.floor };
    }

    const rooms = await this.roomModel
      .find(query)
      .populate('currentResident', 'fullName idNumber')
      .exec();

    return rooms.map((room) => this.toRoomResponseDto(room));
  }

  /** Buscar una habitación por ID (con validación de acceso) */
  async findOne(id: string, user: any): Promise<RoomResponseDto> {
    const room = await this.roomModel
      .findById(id)
      .populate('currentResident', 'fullName idNumber')
      .exec();

    if (!room) throw new NotFoundException('Room not found');
    this.checkRepresentativeAccess(user, room);

    return this.toRoomResponseDto(room);
  }

  /** Buscar por ID centralizado (para usar en otros servicios) */
  async findById(id: string): Promise<RoomDocument> {
    if (!isValidObjectId(id)) {
      throw new BadRequestException(`Invalid Room ID format: ${id}`);
    }

    const room = await this.roomModel.findById(id).exec();
    if (!room) throw new NotFoundException('Room not found');

    return room;
  }

  /** Actualizar habitación */
  async update(
    id: string,
    updateRoomDto: UpdateRoomDto,
    user: any,
  ): Promise<RoomResponseDto> {
    const room = await this.roomModel.findById(id).exec();
    if (!room) throw new NotFoundException('Room not found');

    this.checkRepresentativeAccess(user, room);

    if (
      user.role === 'representative' &&
      updateRoomDto.floor &&
      updateRoomDto.floor !== user.floor
    ) {
      throw new ForbiddenException('No puedes cambiar la habitación a otro piso');
    }

    const nextFloor = updateRoomDto.floor ?? room.floor;
    const nextNumber = updateRoomDto.number ?? room.number;

    this.ensureRoomNumberMatchesFloor(nextNumber, nextFloor);

    if (nextFloor !== room.floor) {
      await this.validateFloorCapacity(nextFloor);
    }

    const updatedRoom = await this.roomModel
      .findByIdAndUpdate(id, updateRoomDto, { new: true })
      .populate('currentResident', 'fullName idNumber')
      .exec();

    if (!updatedRoom) throw new BadRequestException('Failed to update room');
    return this.toRoomResponseDto(updatedRoom);
  }

  /** Eliminar habitación */
  async remove(id: string, user: any): Promise<void> {
    const room = await this.roomModel.findById(id).exec();
    if (!room) throw new NotFoundException('Room not found');

    this.checkRepresentativeAccess(user, room);
    await this.roomModel.findByIdAndDelete(id).exec();
  }

  /** Obtener servicios de una habitación */
  async getRoomService(roomId: string, user: any) {
    const room = await this.roomModel.findById(roomId).exec();
    if (!room) throw new NotFoundException('Room not found');

    this.checkRepresentativeAccess(user, room);
    return this.serviceModel.find({ room: new Types.ObjectId(roomId) }).exec();
  }

 /** Sincronizar ocupación con residentes */
  async syncOccupancy(user: any): Promise<void> {
    let residentsQuery: any = { active: true };

    if (user.role === 'representative') {
      residentsQuery = { ...residentsQuery, floor: user.floor };
    }

    const residents = await this.residentModel.find(residentsQuery).exec();
    const updates = residents.map((resident) =>
      this.roomModel.findByIdAndUpdate(resident.room, {
        occupied: true,
        currentResident: resident._id,
      }),
    );

    await Promise.all(updates);
  }

  /** 🔹 Validar disponibilidad de un piso (wrapper público) */
  async validateFloorAvailability(floor: number): Promise<void> {
    return this.validateFloorCapacity(floor);
  }
}