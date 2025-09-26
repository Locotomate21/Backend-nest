import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Resident, ResidentDocument } from './schema/resident.schema';
import { CreateResidentDto } from './dto/create-resident.dto';
import { UpdateResidentDto } from './dto/update-resident.dto';
import { RoomService } from '../room/room.service';
import { Role } from '../common/roles.enum';
import { UserDocument, User } from '../users/schema/user.schema';

@Injectable()
export class ResidentService {
  constructor(
    @InjectModel(Resident.name)
    private readonly residentModel: Model<ResidentDocument>,
    private readonly roomService: RoomService,
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
  ) {}

  // 🔹 Helper para validar roles
  private checkRole(user: any, allowedRoles: Role[], errorMsg = 'You are not allowed') {
    if (!allowedRoles.includes(user.role)) {
      throw new ForbiddenException(errorMsg);
    }
  }

  // 🔹 CREATE
  async create(createResidentDto: CreateResidentDto, requestUser: any): Promise<Resident> {
    this.checkRole(requestUser, [Role.Admin, Role.Representative], 'You are not allowed to create residents');

    const targetUser = await this.userModel.findById(createResidentDto.user);
    if (!targetUser) throw new NotFoundException('User to link with Resident not found');

    const newResident = new this.residentModel({
      ...createResidentDto,
      enrollmentDate: createResidentDto.enrollmentDate || new Date(),
      user: targetUser._id,
    });

    if (createResidentDto.room) {
      const roomDoc = await this.roomService.findById(createResidentDto.room as string);
      if (!roomDoc) throw new NotFoundException('Room not found');
      if (roomDoc.occupied) throw new ForbiddenException('Room is already occupied');

      // Restricción especial para Representatives
      if (requestUser.role === Role.Representative) {
        if (!requestUser.floor) {
          throw new ForbiddenException('Representative must have an assigned floor');
        }
        if (requestUser.floor !== roomDoc.floor) {
          throw new ForbiddenException(`Representatives can only assign rooms on floor ${requestUser.floor}`);
        }
      }

      roomDoc.currentResident = newResident._id as Types.ObjectId;
      roomDoc.occupied = true;
      await roomDoc.save();

      newResident.room = roomDoc._id as Types.ObjectId;
    }

    await newResident.save();

    targetUser.resident = newResident._id as Types.ObjectId;
    await targetUser.save();

    return newResident.populate('room');
  }

  // 🔹 READ ALL
  async findAll(): Promise<Resident[]> {
    return this.residentModel.find().populate('room').exec();
  }

  // 🔹 READ BY ID
  async findOne(id: string): Promise<Resident> {
    const resident = await this.residentModel.findById(id).populate('room').exec();
    if (!resident) throw new NotFoundException('Resident not found');
    return resident;
  }

  // 🔹 READ BY STUDENT CODE
  async findByStudentCode(studentCode: string): Promise<Resident | null> {
    return this.residentModel
      .findOne({ studentCode: parseInt(studentCode) })
      .populate('room')
      .exec();
  }

  // 🔹 UPDATE
  async update(id: string, updateResidentDto: UpdateResidentDto, user: any): Promise<Resident> {
    this.checkRole(user, [Role.Admin, Role.Representative], 'You are not allowed to update residents');

    const resident = await this.residentModel.findById(id);
    if (!resident) throw new NotFoundException('Resident not found');

    if (
      updateResidentDto.room &&
      (!resident.room || updateResidentDto.room.toString() !== resident.room.toString())
    ) {
      if (resident.room) {
        const oldRoom = await this.roomService.findById(resident.room.toString());
        if (oldRoom) {
          oldRoom.currentResident = null;
          oldRoom.occupied = false;
          await oldRoom.save();
        }
      }

      const newRoom = await this.roomService.findById(updateResidentDto.room as string);
      if (!newRoom) throw new NotFoundException('Room not found');
      if (newRoom.occupied) throw new ForbiddenException('Room is already occupied');

      if (user.role === Role.Representative) {
        if (!user.floor) throw new ForbiddenException('Representative must have an assigned floor');
        if (user.floor !== newRoom.floor) {
          throw new ForbiddenException(`Representatives can only assign rooms on floor ${user.floor}`);
        }
      }

      newRoom.currentResident = resident._id as Types.ObjectId;
      newRoom.occupied = true;
      await newRoom.save();

      resident.room = newRoom._id as Types.ObjectId;
    }

    const { room, ...rest } = updateResidentDto;
    Object.assign(resident, rest);

    await resident.save();
    return resident.populate('room');
  }

  // 🔹 READ BY USER ID
  async findResidentByUserId(userId: string): Promise<Resident> {
    const resident = await this.residentModel
      .findOne({ user: new Types.ObjectId(userId) })
      .populate('room', 'number floor')
      .populate('user', 'fullName email role')
      .exec();

    if (!resident) throw new NotFoundException('Residente no encontrado');
    return resident;
  }

  // 🔹 DELETE
  async remove(id: string, user: any): Promise<void> {
    this.checkRole(user, [Role.Admin], 'You are not allowed to delete residents');

    const resident = await this.residentModel.findById(id);
    if (!resident) throw new NotFoundException('Resident not found');

    if (resident.room) {
      const roomDoc = await this.roomService.findById(resident.room.toString());
      if (roomDoc) {
        roomDoc.currentResident = null;
        roomDoc.occupied = false;
        await roomDoc.save();
      }
    }

    await this.residentModel.findByIdAndDelete(id).exec();
  }

  // 🔹 UPDATE MY PROFILE
  async updateMyProfile(userId: string, updateData: Partial<Resident>, requestUser?: any): Promise<Resident> {
    const resident = await this.residentModel.findOne({ user: userId });
    if (!resident) throw new NotFoundException('Residente no encontrado');

    // 🚨 Restricción: si no es Admin, solo puede editar su propio perfil
    if (requestUser && requestUser.role !== Role.Admin && requestUser._id.toString() !== userId.toString()) {
      throw new ForbiddenException('No puedes modificar el perfil de otro usuario');
    }

    // 🔹 Restricción de tiempo (ejemplo: 30 días)
    const daysSinceEnrollment =
      (Date.now() - new Date(resident.enrollmentDate).getTime()) / (1000 * 60 * 60 * 24);

    if (daysSinceEnrollment > 30 && requestUser?.role !== Role.Admin) {
      throw new ForbiddenException('No puedes actualizar tu información después de 30 días de ingreso');
    }

    // 🔹 Restricción de campos editables
    const allowedFields = requestUser?.role === Role.Admin
      ? ['fullName', 'email', 'phone', 'academicProgram', 'period']
      : ['fullName', 'email', 'phone'];

    for (const key of allowedFields) {
      if (updateData[key] !== undefined) {
        (resident as any)[key] = updateData[key];
      }
    }

    await resident.save();
    return resident.populate('room');
  }
}