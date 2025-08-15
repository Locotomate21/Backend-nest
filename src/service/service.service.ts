import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Service, ServiceDocument } from '../service/schema/service.schema';
import { CreateServiceDto } from '../service/dto/create-service.dto';
import { UpdateServiceDto } from '../service/dto/update-service.dto';

@Injectable()
export class ServiceService {
  constructor(
    @InjectModel(Service.name) private readonly serviceModel: Model<ServiceDocument>,
  ) {}

  async create(createServiceDto: CreateServiceDto): Promise<Service> {
    const created = new this.serviceModel(createServiceDto);
    return created.save();
  }

  async findAll(): Promise<Service[]> {
    return this.serviceModel.find().populate('room').exec();
  }

  async findOne(id: string): Promise<Service> {
    const service = await this.serviceModel.findById(id).populate('room').exec();
    if (!service) throw new NotFoundException('Service not found');
    return service;
  }

  async update(id: string, updateServiceDto: UpdateServiceDto): Promise<Service> {
    const updated = await this.serviceModel.findByIdAndUpdate(id, updateServiceDto, { new: true }).exec();
    if (!updated) throw new NotFoundException('Service not found');
    return updated;
  }

  async remove(id: string): Promise<void> {
    const deleted = await this.serviceModel.findByIdAndDelete(id).exec();
    if (!deleted) throw new NotFoundException('Service not found');
  }
}
