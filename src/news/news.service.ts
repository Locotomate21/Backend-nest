import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { News } from './schema/news.schema';
import { CreateNewsDto } from './dto/create-news.dto';
import { Role } from '../common/roles.enum';

@Injectable()
export class NewsService {
  constructor(@InjectModel(News.name) private readonly newsModel: Model<News>) {}

  // ✅ CREATE
  async create(dto: CreateNewsDto, user: any) {
    const { role, floor, _id } = user;

    if (dto.type === 'general') {
      if (![Role.Admin, Role.President, Role.SecretaryGeneral].includes(role)) {
        throw new ForbiddenException('No tienes permiso para crear noticias generales');
      }
    }

    if (dto.type === 'floor') {
      if (role !== Role.Representative) {
        throw new ForbiddenException('Solo los representantes pueden crear noticias de piso');
      }

      if (!floor) {
        throw new ForbiddenException('El representante no tiene piso asignado');
      }

      dto.floor = floor; // fuerza a que sea solo su piso
    }

    const news = new this.newsModel({
      ...dto,
      createdBy: _id,
      publishedAt: new Date(),
    });

    return news.save();
  }

  // ✅ FIND ALL
  async findAll(user: any) {
    if (user.role === Role.Representative || user.role === Role.Resident) {
      // solo ven noticias de su piso + generales
      return this.newsModel
        .find({
          $or: [{ type: 'general' }, { type: 'floor', floor: user.floor }],
        })
        .populate('createdBy', '_id fullName role');
    }

    // Admin, president, secretaryGeneral → ven todas
    return this.newsModel.find().populate('createdBy', '_id fullName role');
  }

  // ✅ FIND ONE con validación de permisos
  async findOne(id: string, user: any) {
    const news = await this.newsModel
      .findById(id)
      .populate('createdBy', '_id fullName role');

    if (!news) throw new NotFoundException(`Noticia con id ${id} no encontrada`);

    // Restricción de acceso
    if (news.type === 'floor') {
      if (
        (user.role === Role.Resident || user.role === Role.Representative) &&
        news.floor?.toString() !== user.floor?.toString()
      ) {
        throw new ForbiddenException('No tienes permiso para ver esta noticia');
      }
    }

    return news;
  }

  // ✅ DELETE con validación de roles
  async delete(id: string, user: any) {
    const news = await this.newsModel.findById(id);
    if (!news) throw new NotFoundException('Noticia no encontrada');

    // Restricciones de borrado: solo quien la creó o admin/president/secGen
    if (
      news.createdBy?.toString() !== user._id.toString() &&
      ![Role.Admin, Role.President, Role.SecretaryGeneral].includes(user.role)
    ) {
      throw new ForbiddenException('No tienes permiso para eliminar esta noticia');
    }

    return this.newsModel.findByIdAndDelete(id);
  }
}
