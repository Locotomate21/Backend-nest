import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Resident, ResidentDocument } from './schema/resident.schema';
import { CreateResidentDto } from './dto/create-resident.dto';
import { UpdateResidentDto } from './dto/update-resident.dto';
import { RoomService } from '../room/room.service';
import { CreateRoomDto } from '../room/dto/create-room.dto';

@Injectable()
export class ResidentService {
  constructor(
    @InjectModel(Resident.name) 
    private readonly residentModel: Model<ResidentDocument>,
    private readonly roomService: RoomService,
  ) {}

  async create(createResidentDto: CreateResidentDto): Promise<Resident> {
    const newResident = new this.residentModel(createResidentDto);
    return newResident.save();
  }
  
  async findAll(): Promise<Resident[]> {
    return this.residentModel.find().populate('room').exec();
  }

  async findOne(id: string): Promise<Resident> {
    const resident = await this.residentModel.findById(id).populate('room').exec();
    if (!resident) throw new NotFoundException('Resident not found');
    return resident;
  }

  async update(id: string, updateResidentDto: UpdateResidentDto): Promise<Resident> {
    const updatedResident = await this.residentModel
      .findByIdAndUpdate(id, updateResidentDto, { new: true })
      .exec();
    if (!updatedResident) throw new NotFoundException('Resident not found');
    return updatedResident;
  }

  async remove(id: string): Promise<void> {
    const deleted = await this.residentModel.findByIdAndDelete(id).exec();
    if (!deleted) throw new NotFoundException('Resident not found');
  }

  // 🔹 Creamos una habitación usando RoomService
  async createRoomForResident(createRoomDto: CreateRoomDto) {
    return this.roomService.create(createRoomDto);
  }
}
